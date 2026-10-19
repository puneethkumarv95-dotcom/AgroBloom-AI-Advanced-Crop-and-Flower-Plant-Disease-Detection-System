const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const Detection = require('../models/Detection');
const NutrientPrediction = require('../models/NutrientPrediction');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

// Helper to proxy image upload to FastAPI
async function proxyToFastApi(endpoint, req, additionalFields = {}) {
  let imageStream;
  try {
    const formData = new FormData();
    imageStream = fs.createReadStream(req.file.path);
    formData.append('file', imageStream, {
      filename: req.file.filename,
      contentType: req.file.mimetype
    });
    for (const [key, val] of Object.entries(additionalFields)) {
      if (val !== undefined && val !== null) {
        formData.append(key, String(val));
      }
    }

    const aiResponse = await axios.post(`${AI_SERVICE_URL}${endpoint}`, formData, {
      headers: formData.getHeaders(),
      timeout: 90000
    });
    return aiResponse.data;
  } finally {
    if (imageStream) {
      imageStream.destroy();
      if (!imageStream.closed) {
        await new Promise((resolve) => imageStream.once('close', resolve));
      }
    }
  }
}

// @desc    Upload leaf image, run AI diagnosis, and persist detection record
// @route   POST /api/detections/diagnose
// @access  Public (Optional auth for user association)
exports.diagnoseLeaf = async (req, res) => {
  let keepImage = false;
  let imageStream;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a plant leaf image' });
    }

    const filePath = req.file.path;
    const originalImageUrl = `/uploads/${req.file.filename}`;

    const formData = new FormData();
    imageStream = fs.createReadStream(filePath);
    formData.append('file', imageStream, {
      filename: req.file.filename,
      contentType: req.file.mimetype
    });
    if (req.body.plantType) {
      formData.append('plantType', req.body.plantType);
    }

    let aiResult;
    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict/image`, formData, {
        headers: formData.getHeaders(),
        timeout: 90000
      });
      aiResult = aiResponse.data;
    } catch (aiErr) {
      const upstreamStatus = aiErr.response?.status;
      const upstreamDetail = aiErr.response?.data?.detail;
      const statusCode = upstreamStatus >= 400 && upstreamStatus < 500 ? 400 : 503;
      console.error('[AI Service Error]:', aiErr.message);
      return res.status(statusCode).json({
        success: false,
        status: upstreamDetail?.status || (statusCode === 400 ? 'INVALID_IMAGE' : 'AI_SERVICE_UNAVAILABLE'),
        message: upstreamDetail?.message
          || (typeof upstreamDetail === 'string' ? upstreamDetail : null)
          || 'AI Diagnostic Engine is currently unavailable.'
      });
    }

    if (aiResult.status === 'MODEL_NOT_READY') {
      return res.status(503).json({
        success: false,
        status: 'MODEL_NOT_READY',
        message: aiResult.message
      });
    }
    if (
      aiResult.status !== 'SUCCESS' ||
      typeof aiResult.className !== 'string' ||
      !aiResult.diseaseDetails ||
      !Number.isFinite(aiResult.confidence)
    ) {
      return res.status(502).json({
        success: false,
        status: 'INVALID_MODEL_RESPONSE',
        message: 'The AI service returned an incomplete diagnosis.'
      });
    }

    const details = aiResult.diseaseDetails;
    const gradCamUrl = aiResult.gradCamUrl ? `${AI_SERVICE_URL}${aiResult.gradCamUrl}` : '';

    const topPredictions = (aiResult.topPredictions && aiResult.topPredictions.length > 0)
      ? aiResult.topPredictions.map((tp) => ({
          label: tp.label || tp.className || aiResult.className,
          confidence: tp.confidence,
          plant: details.plant,
          disease: tp.className || details.disease
        }))
      : [{
          label: aiResult.className,
          confidence: aiResult.confidence,
          plant: details.plant,
          disease: details.disease
        }];

    const detection = await Detection.create({
      user: req.user ? req.user._id : null,
      plantType: details.type,
      plantName: details.plant,
      condition: details.condition,
      primaryDisease: details.disease,
      confidence: aiResult.confidence,
      topPredictions,
      multipleDiseases: [],
      severity: {
        percentage: null,
        level: 'Not assessed',
        affectedAreaSquarePixels: null
      },
      originalImageUrl,
      gradCamImageUrl: gradCamUrl,
      segmentationMaskUrl: '',
      recommendations: details.recommendations,
      isOutOfDistribution: aiResult.isUncertain || null,
      modelUsed: aiResult.modelUsed || 'MobileNetV2',
      notes: typeof req.body.notes === 'string' ? req.body.notes.slice(0, 1000) : ''
    });
    keepImage = true;

    return res.status(201).json({
      success: true,
      detection,
      pathogenDetails: details.causalAgent,
      gradCamUrl: gradCamUrl || null,
      gradCamExplanation: aiResult.gradCamExplanation,
      isUncertain: aiResult.isUncertain,
      uncertaintyWarning: aiResult.uncertaintyWarning,
      entropy: aiResult.entropy,
      segmentationStatus: aiResult.segmentationStatus || 'DATASET_REQUIRED',
      severityStatus: 'SEVERITY_NOT_AVAILABLE',
      multipleDetectionStatus: 'DATASET_REQUIRED'
    });
  } catch (error) {
    console.error('[Diagnose Controller Error]:', error);
    return res.status(500).json({ success: false, message: 'Unable to save the diagnosis record' });
  } finally {
    if (imageStream) {
      imageStream.destroy();
      if (!imageStream.closed) {
        await new Promise((resolve) => imageStream.once('close', resolve));
      }
    }
    if (req.file && !keepImage) {
      await fs.promises.rm(req.file.path, { force: true });
    }
  }
};

// @desc    Diagnose specifically for crop plants
// @route   POST /api/detections/crop
exports.diagnoseCrop = async (req, res) => {
  req.body.plantType = 'crop';
  return exports.diagnoseLeaf(req, res);
};

// @desc    Diagnose specifically for flowering plants
// @route   POST /api/detections/flower
exports.diagnoseFlower = async (req, res) => {
  req.body.plantType = 'flower';
  return exports.diagnoseLeaf(req, res);
};

// @desc    Compute Grad-CAM for leaf image
// @route   POST /api/detections/explain/gradcam
exports.explainGradCam = async (req, res) => {
  let keepImage = false;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a plant leaf image' });
    }
    const aiData = await proxyToFastApi('/explain/gradcam', req, {
      plantType: req.body.plantType || 'crop',
      targetClassIndex: req.body.targetClassIndex
    });
    keepImage = true;
    if (aiData.gradCamUrl) {
      aiData.gradCamUrl = `${AI_SERVICE_URL}${aiData.gradCamUrl}`;
    }
    return res.status(200).json({ success: true, ...aiData });
  } catch (error) {
    console.error('[Grad-CAM Error]:', error.message);
    const status = error.response?.status || 500;
    return res.status(status).json({
      success: false,
      message: error.response?.data?.detail || 'Grad-CAM calculation failed'
    });
  } finally {
    if (req.file && !keepImage) {
      await fs.promises.rm(req.file.path, { force: true });
    }
  }
};

// @desc    Disease region segmentation endpoint (DATASET_REQUIRED)
// @route   POST /api/detections/segment/disease
exports.segmentDisease = async (req, res) => {
  let keepImage = false;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a plant leaf image' });
    }
    const aiData = await proxyToFastApi('/segment/disease', req);
    keepImage = true;
    return res.status(200).json({ success: true, ...aiData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (req.file && !keepImage) {
      await fs.promises.rm(req.file.path, { force: true });
    }
  }
};

// @desc    Disease severity estimation endpoint (SEVERITY_NOT_AVAILABLE)
// @route   POST /api/detections/predict/severity
exports.predictSeverity = async (req, res) => {
  let keepImage = false;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a plant leaf image' });
    }
    const aiData = await proxyToFastApi('/predict/severity', req);
    keepImage = true;
    return res.status(200).json({ success: true, ...aiData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (req.file && !keepImage) {
      await fs.promises.rm(req.file.path, { force: true });
    }
  }
};

// @desc    Multiple disease detection endpoint (DATASET_REQUIRED)
// @route   POST /api/detections/predict/multiple
exports.predictMultiple = async (req, res) => {
  let keepImage = false;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a plant leaf image' });
    }
    const aiData = await proxyToFastApi('/predict/multiple', req);
    keepImage = true;
    return res.status(200).json({ success: true, ...aiData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (req.file && !keepImage) {
      await fs.promises.rm(req.file.path, { force: true });
    }
  }
};

// @desc    Unknown / OOD detection endpoint
// @route   POST /api/detections/detect/unknown
exports.detectUnknown = async (req, res) => {
  let keepImage = false;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a plant leaf image' });
    }
    const aiData = await proxyToFastApi('/detect/unknown', req, {
      plantType: req.body.plantType || 'crop'
    });
    keepImage = true;
    return res.status(200).json({ success: true, ...aiData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (req.file && !keepImage) {
      await fs.promises.rm(req.file.path, { force: true });
    }
  }
};

// @desc    Get detection history
// @route   GET /api/detections/history
// @access  Public / Private
exports.getHistory = async (req, res) => {
  try {
    const filter = { user: req.user ? req.user._id : null };
    const { search, plantType, condition, startDate, endDate, page = 1, limit = 60 } = req.query;

    if (plantType && plantType !== 'All') {
      filter.plantType = plantType;
    }
    if (condition && condition !== 'All') {
      filter.condition = condition;
    }
    if (search) {
      filter.$or = [
        { plantName: { $regex: search, $options: 'i' } },
        { primaryDisease: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 60, 1), 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [detections, total] = await Promise.all([
      Detection.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      Detection.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      count: detections.length,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit) || 1,
      detections
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single detection by ID
// @route   GET /api/detections/:id
// @access  Public
exports.getDetectionById = async (req, res) => {
  try {
    const detection = await Detection.findOne({
      _id: req.params.id,
      user: req.user ? req.user._id : null
    });
    if (!detection) {
      return res.status(404).json({ success: false, message: 'Detection record not found' });
    }
    return res.status(200).json({ success: true, detection });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get AI model status and metadata
// @route   GET /api/detections/models/status
exports.getModelStatus = async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/model/status`, { timeout: 90000 });
    return res.status(200).json({ success: true, ...response.data });
  } catch (err) {
    return res.status(503).json({
      success: false,
      status: 'MODEL_SERVICE_OFFLINE',
      message: 'FastAPI microservice unreachable'
    });
  }
};

// @desc    Delete detection record
// @route   DELETE /api/detections/:id
// @access  Private
exports.deleteDetection = async (req, res) => {
  try {
    const detection = await Detection.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!detection) {
      return res.status(404).json({ success: false, message: 'Detection record not found' });
    }
    await detection.deleteOne();
    return res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get nutrient model status
// @route   GET /api/detections/nutrient/status
exports.getNutrientStatus = async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/model/nutrient-status`, { timeout: 15000 });
    return res.status(200).json({ success: true, ...response.data });
  } catch (err) {
    return res.status(200).json({
      success: true,
      status: 'DATASET_REQUIRED',
      modelReady: false,
      message: 'Nutrient deficiency model requires laboratory tissue assay ground truth.'
    });
  }
};

// @desc    Predict nutrient deficiency (returns MODEL_NOT_READY / DATASET_REQUIRED)
// @route   POST /api/detections/nutrient
exports.predictNutrient = async (req, res) => {
  let keepImage = false;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a plant leaf image' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;

    if (req.user) {
      await NutrientPrediction.create({
        user: req.user._id,
        imageUrl,
        plantSpecies: req.body.plantSpecies || 'Unspecified',
        status: 'DATASET_REQUIRED',
        notes: req.body.notes || ''
      });
      keepImage = true;
    }

    try {
      await proxyToFastApi('/predict/nutrient-deficiency', req);
    } catch (aiErr) {
      const upstreamStatus = aiErr.response?.status || 503;
      const detail = aiErr.response?.data?.detail || {};
      return res.status(upstreamStatus).json({
        success: false,
        status: detail.status || 'DATASET_REQUIRED',
        error: detail.error || 'MODEL_NOT_READY',
        message: detail.message || 'Nutrient deficiency diagnostic model requires laboratory tissue assay dataset.',
        diagnosticAdvisory: detail.diagnosticAdvisory || 'Definitive diagnosis requires soil or foliar tissue testing.',
        supportedDeficiencies: detail.supportedDeficiencies || [
          'Nitrogen (N) Deficiency',
          'Phosphorus (P) Deficiency',
          'Potassium (K) Deficiency',
          'Magnesium (Mg) Deficiency',
          'Iron (Fe) Interveinal Chlorosis'
        ]
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (req.file && !keepImage) {
      await fs.promises.rm(req.file.path, { force: true });
    }
  }
};

// @desc    Synchronize offline-detected records from browser IndexedDB
// @route   POST /api/detections/offline-sync
// @access  Protected
exports.syncOfflineDetections = async (req, res) => {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'No offline records provided for synchronization' });
    }

    const syncedRecords = [];
    const skippedRecords = [];

    for (const r of records) {
      if (!r.plantName || !r.primaryDisease) {
        skippedRecords.push({ id: r.clientLocalId || null, reason: 'Missing essential plant or disease name' });
        continue;
      }

      // Check if duplicate already exists for this user with same timestamp/targetClass
      const existing = await Detection.findOne({
        user: req.user._id,
        plantName: r.plantName,
        primaryDisease: r.primaryDisease,
        confidence: r.confidence || 0
      });

      if (existing) {
        skippedRecords.push({ id: r.clientLocalId || null, reason: 'Duplicate record already synchronized' });
        continue;
      }

      const doc = await Detection.create({
        user: req.user._id,
        plantType: r.plantType === 'flower' ? 'flower' : 'crop',
        plantName: r.plantName,
        condition: r.condition || (r.primaryDisease?.toLowerCase().includes('healthy') ? 'healthy' : 'diseased'),
        primaryDisease: r.primaryDisease,
        confidence: Number(r.confidence) || 85.0,
        topPredictions: (r.topPredictions || []).map((tp) => ({
          label: tp.label || tp.className || 'Unknown',
          confidence: Number(tp.confidence) || 0,
          plant: r.plantName,
          disease: r.primaryDisease
        })),
        originalImageUrl: r.imageUrl || '/uploads/offline-leaf.png',
        modelUsed: r.modelUsed || 'MobileNetV2 (Offline Browser Engine)',
        notes: `Synchronized from local offline browser storage. Local timestamp: ${r.timestamp || new Date().toISOString()}`,
        recommendations: {
          organic: r.advice?.organic || [],
          chemical: r.advice?.chemical || [],
          prevention: r.advice?.prevention || []
        }
      });

      syncedRecords.push(doc);
    }

    res.status(201).json({
      success: true,
      message: `Synchronized ${syncedRecords.length} offline records successfully.`,
      syncedCount: syncedRecords.length,
      skippedCount: skippedRecords.length,
      syncedIds: syncedRecords.map((d) => d._id),
      skipped: skippedRecords
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


