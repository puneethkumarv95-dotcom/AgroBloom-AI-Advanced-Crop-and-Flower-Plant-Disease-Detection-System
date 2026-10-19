const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const multer = require('multer');
const connectDB = require('./config/db');
const upload = require('./middleware/upload');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve uploaded assets statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'AgroBloom AI Node.js Express Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Proxy route for AI model status
app.get('/api/ai/status', async (req, res) => {
  const aiUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
  try {
    const aiRes = await axios.get(`${aiUrl}/model/status`, { timeout: 90000 });
    res.json({ success: true, aiService: aiRes.data });
  } catch (err) {
    console.error('[AI Service Status Error]:', err.message);
    res.status(503).json({
      success: false,
      aiService: {
        status: 'AI_SERVICE_UNAVAILABLE',
        message: 'AI Service is initializing or offline.',
        ready: false
      }
    });
  }
});

// Proxy route for AI image prediction (forwards to FastAPI /predict/image)
app.post('/api/ai/predict', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please provide a plant leaf image' });
  }

  const aiUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
  const formData = new FormData();
  const imageStream = fs.createReadStream(req.file.path);
  formData.append('file', imageStream, {
    filename: req.file.filename,
    contentType: req.file.mimetype
  });

  try {
    const aiRes = await axios.post(`${aiUrl}/predict/image`, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 90000
    });
    return res.json({ success: true, result: aiRes.data });
  } catch (err) {
    const upstreamStatus = err.response?.status;
    const upstreamDetail = err.response?.data?.detail;
    const statusCode = upstreamStatus === 400 ? 400 : 503;
    return res.status(statusCode).json({
      success: false,
      message: upstreamDetail?.message
        || (typeof upstreamDetail === 'string' ? upstreamDetail : null)
        || 'AI Service could not process request',
      status: upstreamDetail?.status || (upstreamStatus === 400 ? 'INVALID_IMAGE' : 'AI_SERVICE_UNAVAILABLE')
    });
  } finally {
    imageStream.destroy();
    if (!imageStream.closed) {
      await new Promise((resolve) => imageStream.once('close', resolve));
    }
    await fs.promises.rm(req.file.path, { force: true });
  }
});

// Mount Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api', require('./routes/plant_disease.routes'));
app.use('/api/detections', require('./routes/detection.routes'));
app.use('/api/community', require('./routes/community.routes'));
app.use('/api/consultations', require('./routes/consultation.routes'));
app.use('/api/reminders', require('./routes/reminder.routes'));
app.use('/api/recovery', require('./routes/recovery.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/care-plans', require('./routes/care_plan.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/experts', require('./routes/expert.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/models', require('./routes/model.routes'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Centralized Error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(statusCode).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE'
        ? 'File size exceeds the maximum allowed threshold of 10MB.'
        : 'Invalid image upload.'
    });
  }
  if (err.message?.startsWith('Invalid file format')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  console.error('[Backend Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const startServer = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }
  await connectDB();
  const seedDiseaseKnowledge = require('./utils/seedDiseaseKnowledge');
  await seedDiseaseKnowledge();
  return app.listen(PORT, () => {
    console.log(`[Backend] AgroBloom AI Express server running on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('[Backend Startup Error]:', error.name || 'StartupError');
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
