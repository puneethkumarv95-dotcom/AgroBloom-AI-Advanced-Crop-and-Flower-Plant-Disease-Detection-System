const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const request = require('supertest');

const { app } = require('../server');
const connectDB = require('../config/db');
const User = require('../models/User');
const Reminder = require('../models/Reminder');
const Post = require('../models/Post');
const Plant = require('../models/Plant');
const Disease = require('../models/Disease');
const Detection = require('../models/Detection');
const ChatConversation = require('../models/ChatConversation');
const ChatMessage = require('../models/ChatMessage');
const RecoveryRecord = require('../models/RecoveryRecord');
const RecoveryObservation = require('../models/RecoveryObservation');
const PlantCarePlan = require('../models/PlantCarePlan');
const DiseaseKnowledge = require('../models/DiseaseKnowledge');
const NutrientPrediction = require('../models/NutrientPrediction');
const seedDiseaseKnowledge = require('../utils/seedDiseaseKnowledge');

const testEmail = `test.${process.pid}@agrobloom.com`;
let testToken;
let testUserId;

test.before(async () => {
  await connectDB();
  await seedDiseaseKnowledge();
  await User.deleteOne({ email: testEmail });
});

test.after(async () => {
  if (testUserId) {
    await Reminder.deleteMany({ user: testUserId });
    await Post.deleteMany({ author: testUserId });
    await Detection.deleteMany({ user: testUserId });
    await ChatConversation.deleteMany({ user: testUserId });
    await ChatMessage.deleteMany({ user: testUserId });
    await RecoveryRecord.deleteMany({ user: testUserId });
    await RecoveryObservation.deleteMany({});
    await PlantCarePlan.deleteMany({ user: testUserId });
    await NutrientPrediction.deleteMany({ user: testUserId });
  }
  await User.deleteOne({ email: testEmail });
  await Plant.deleteMany({ commonName: 'Test Plant Tomato' });
  await Disease.deleteMany({ name: 'Test Disease Early Blight' });
  await mongoose.disconnect();
});

test('health endpoint reports the Express service', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.equal(response.body.status, 'healthy');
  assert.equal(response.body.service, 'AgroBloom AI Node.js Express Backend');
});

test('registration validates inputs and prevents assigning admin role', async () => {
  const invalidEmail = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test User', email: 'invalid-email', password: 'password123' })
    .expect(400);
  assert.equal(invalidEmail.body.success, false);

  const shortPassword = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test User', email: testEmail, password: 'short' })
    .expect(400);
  assert.equal(shortPassword.body.success, false);

  const adminRole = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test User', email: testEmail, password: 'password123', role: 'admin' })
    .expect(400);
  assert.equal(adminRole.body.success, false);
});

test('registration persists a bcrypt hash and returns a verifiable JWT', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Ramesh Kumar',
      email: testEmail,
      password: 'securepassword123',
      role: 'farmer',
      farmLocation: 'Mandya, Karnataka',
      phone: '+919876543210',
      preferredLanguage: 'kn'
    })
    .expect(201);

  assert.equal(response.body.success, true);
  assert.equal(response.body.user.name, 'Ramesh Kumar');
  assert.equal(response.body.user.role, 'farmer');
  assert.ok(response.body.token);
  testToken = response.body.token;
  testUserId = response.body.user.id;

  const storedUser = await User.findById(testUserId).select('+password');
  assert.notEqual(storedUser.password, 'securepassword123');
  assert.equal(await bcrypt.compare('securepassword123', storedUser.password), true);
});

test('duplicate email registration is rejected', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Duplicate User', email: testEmail, password: 'anotherpassword' })
    .expect(400);
  assert.equal(response.body.success, false);
});

test('login accepts valid credentials and rejects invalid credentials', async () => {
  const success = await request(app)
    .post('/api/auth/login')
    .send({ email: testEmail.toUpperCase(), password: 'securepassword123' })
    .expect(200);
  assert.equal(success.body.success, true);
  assert.ok(success.body.token);

  const failure = await request(app)
    .post('/api/auth/login')
    .send({ email: testEmail, password: 'wrongpassword' })
    .expect(401);
  assert.equal(failure.body.success, false);
});

test('protected profile routes reject missing and invalid tokens', async () => {
  await request(app).get('/api/auth/me').expect(401);
  await request(app)
    .get('/api/auth/me')
    .set('Authorization', 'Bearer invalid-token')
    .expect(401);
});

test('authenticated users can retrieve and update their profile', async () => {
  const profile = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${testToken}`)
    .expect(200);
  assert.equal(profile.body.user.email, testEmail);

  const updated = await request(app)
    .put('/api/auth/profile')
    .set('Authorization', `Bearer ${testToken}`)
    .send({ farmLocation: 'Mysuru, Karnataka', bio: 'Tomato grower' })
    .expect(200);
  assert.equal(updated.body.user.farmLocation, 'Mysuru, Karnataka');
  assert.equal(updated.body.user.bio, 'Tomato grower');
});

test('plant and disease collections support authenticated creation and public reads', async () => {
  await request(app)
    .post('/api/plants')
    .set('Authorization', `Bearer ${testToken}`)
    .send({
      commonName: 'Test Plant Tomato',
      scientificName: 'Solanum lycopersicum',
      category: 'crop',
      description: 'Test tomato cultivar'
    })
    .expect(201);

  await request(app)
    .post('/api/diseases')
    .set('Authorization', `Bearer ${testToken}`)
    .send({
      name: 'Test Disease Early Blight',
      pathogen: 'Alternaria solani',
      category: 'fungal',
      symptoms: 'Concentric ring target spots',
      severityRisk: 'Moderate'
    })
    .expect(201);

  const list = await request(app).get('/api/diseases').expect(200);
  assert.ok(list.body.diseases.some((disease) => disease.name === 'Test Disease Early Blight'));
});

test('plant care reminders support create, list, and completion toggle', async () => {
  const created = await request(app)
    .post('/api/reminders')
    .set('Authorization', `Bearer ${testToken}`)
    .send({
      plantName: 'Tomato Plot B',
      taskType: 'Fungicide Spray',
      title: 'Apply Mancozeb',
      dueDate: new Date(),
      frequency: 'Weekly'
    })
    .expect(201);
  const reminderId = created.body.reminder._id;

  const listed = await request(app)
    .get('/api/reminders')
    .set('Authorization', `Bearer ${testToken}`)
    .expect(200);
  assert.ok(listed.body.reminders.some((reminder) => reminder._id === reminderId));

  const toggled = await request(app)
    .patch(`/api/reminders/${reminderId}/toggle`)
    .set('Authorization', `Bearer ${testToken}`)
    .expect(200);
  assert.equal(toggled.body.reminder.isCompleted, true);
});

test('community members can create a post and comment', async () => {
  const created = await request(app)
    .post('/api/community/posts')
    .set('Authorization', `Bearer ${testToken}`)
    .send({
      title: 'Bio-control of Late Blight',
      content: 'Trichoderma viride efficacy trials.',
      category: 'Organic Remedies'
    })
    .expect(201);

  const comment = await request(app)
    .post(`/api/community/posts/${created.body.post._id}/comments`)
    .set('Authorization', `Bearer ${testToken}`)
    .send({ text: 'Great observation!' })
    .expect(201);
  assert.equal(comment.body.comments[0].text, 'Great observation!');
});

test('AI image route rejects absent and unsupported uploads', async () => {
  await request(app).post('/api/ai/predict').expect(400);
  await request(app)
    .post('/api/ai/predict')
    .attach('image', Buffer.from('not an image'), { filename: 'leaf.gif', contentType: 'image/gif' })
    .expect(400);
});

test('AI image proxy returns model-not-ready without fabricating a detection', async () => {
  const originalPost = axios.post;
  axios.post = async (_url, formData) => {
    await new Promise((resolve, reject) => {
      formData.once('end', resolve);
      formData.once('error', reject);
      formData.resume();
    });
    return { data: { status: 'MODEL_NOT_READY', ready: false } };
  };

  try {
    const response = await request(app)
      .post('/api/ai/predict')
      .attach(
        'image',
        Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/S6sAAAAASUVORK5CYII=', 'base64'),
        { filename: 'leaf.png', contentType: 'image/png' }
      )
      .expect(200);
    assert.equal(response.body.result.status, 'MODEL_NOT_READY');
    assert.equal(response.body.result.ready, false);
  } finally {
    axios.post = originalPost;
  }
});

test('crop upload uses the FastAPI image route and never stores MODEL_NOT_READY', async () => {
  const originalPost = axios.post;
  let upstreamUrl;
  axios.post = async (url, formData) => {
    upstreamUrl = url;
    await new Promise((resolve, reject) => {
      formData.once('end', resolve);
      formData.once('error', reject);
      formData.resume();
    });
    const err = new Error('Model is not available');
    err.response = {
      status: 503,
      data: {
        detail: {
          status: 'MODEL_NOT_READY',
          message: 'Model is not available'
        }
      }
    };
    throw err;
  };

  try {
    const before = await Detection.countDocuments({ user: null });
    const response = await request(app)
      .post('/api/detections/crop')
      .attach(
        'image',
        Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/S6sAAAAASUVORK5CYII=', 'base64'),
        { filename: 'leaf.png', contentType: 'image/png' }
      )
      .expect(503);
    assert.equal(upstreamUrl, 'http://127.0.0.1:8000/predict/image');
    assert.equal(response.body.status, 'MODEL_NOT_READY');
    assert.equal(response.body.message, 'Model is not available');
    assert.equal(await Detection.countDocuments({ user: null }), before);
  } finally {
    axios.post = originalPost;
  }
});

test('successful diagnosis persists genuine detection record to MongoDB', async () => {
  const originalPost = axios.post;
  axios.post = async (url, formData) => {
    await new Promise((resolve, reject) => {
      formData.once('end', resolve);
      formData.once('error', reject);
      formData.resume();
    });
    return {
      data: {
        status: 'SUCCESS',
        className: 'Tomato___Early_blight',
        confidence: 94.5,
        diseaseDetails: {
          type: 'crop',
          plant: 'Tomato',
          condition: 'diseased',
          disease: 'Early Blight',
          causalAgent: 'Alternaria solani',
          recommendations: { organic: ['Neem oil spray'] }
        }
      }
    };
  };

  try {
    const response = await request(app)
      .post('/api/detections/crop')
      .attach(
        'image',
        Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/S6sAAAAASUVORK5CYII=', 'base64'),
        { filename: 'leaf.png', contentType: 'image/png' }
      )
      .expect(201);

    assert.equal(response.body.success, true);
    assert.equal(response.body.detection.plantName, 'Tomato');
    assert.equal(response.body.detection.primaryDisease, 'Early Blight');
    assert.equal(response.body.detection.confidence, 94.5);
    assert.equal(response.body.detection.topPredictions.length, 1);
    assert.equal(response.body.detection.severity.level, 'Not assessed');

    // Verify record in MongoDB
    const persisted = await Detection.findById(response.body.detection._id);
    assert.ok(persisted);
    assert.equal(persisted.plantName, 'Tomato');
    assert.equal(persisted.primaryDisease, 'Early Blight');

    // Clean up
    await persisted.deleteOne();
  } finally {
    axios.post = originalPost;
  }
});

test('detection history and reports are scoped to the authenticated owner', async () => {
  const record = await Detection.create({
    user: testUserId,
    plantType: 'crop',
    plantName: 'Tomato',
    condition: 'diseased',
    primaryDisease: 'Early Blight',
    confidence: 78.25,
    originalImageUrl: '/uploads/test-private.png',
    severity: { level: 'Not assessed', percentage: null },
    isOutOfDistribution: null
  });

  const guestHistory = await request(app).get('/api/detections/history').expect(200);
  assert.ok(!guestHistory.body.detections.some((item) => item._id === record.id));
  await request(app).get(`/api/detections/${record.id}`).expect(404);
  await request(app).get(`/api/reports/${record.id}/pdf`).expect(404);

  const ownerHistory = await request(app)
    .get('/api/detections/history')
    .set('Authorization', `Bearer ${testToken}`)
    .expect(200);
  assert.ok(ownerHistory.body.detections.some((item) => item._id === record.id));

  const report = await request(app)
    .get(`/api/reports/${record.id}/pdf`)
    .set('Authorization', `Bearer ${testToken}`)
    .expect(200)
    .expect('Content-Type', /application\/pdf/);
  assert.ok(report.body.length > 0);

  await request(app).delete(`/api/detections/${record.id}`).expect(401);
  await request(app)
    .delete(`/api/detections/${record.id}`)
    .set('Authorization', `Bearer ${testToken}`)
    .expect(200);
});

test('Phase 3 endpoints return valid XAI and status descriptors', async () => {
  const originalPost = axios.post;
  axios.post = async (url, formData) => {
    await new Promise((resolve, reject) => {
      formData.once('end', resolve);
      formData.once('error', reject);
      formData.resume();
    });
    if (url.includes('/explain/gradcam')) {
      return {
        data: {
          success: true,
          gradCamUrl: '/static/gradcam/test.jpg',
          targetConvLayer: 'out_relu',
          explanation: 'Grad-CAM visualizes model attention'
        }
      };
    }
    if (url.includes('/segment/disease')) {
      return {
        data: {
          status: 'DATASET_REQUIRED',
          success: false,
          module: 'disease_region_segmentation'
        }
      };
    }
    if (url.includes('/predict/severity')) {
      return {
        data: {
          status: 'SEVERITY_NOT_AVAILABLE',
          success: false,
          severity: { level: 'SEVERITY_NOT_AVAILABLE', percentage: null }
        }
      };
    }
    if (url.includes('/predict/multiple')) {
      return {
        data: {
          status: 'DATASET_REQUIRED',
          success: false,
          module: 'multiple_disease_detection'
        }
      };
    }
    return { data: { success: true } };
  };

  try {
    const pngBuf = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/S6sAAAAASUVORK5CYII=', 'base64');
    
    // Grad-CAM
    const gradcamRes = await request(app)
      .post('/api/detections/explain/gradcam')
      .attach('image', pngBuf, { filename: 'leaf.png', contentType: 'image/png' })
      .expect(200);
    assert.equal(gradcamRes.body.success, true);
    assert.ok(gradcamRes.body.gradCamUrl.includes('test.jpg'));

    // Segmentation status
    const segRes = await request(app)
      .post('/api/detections/segment/disease')
      .attach('image', pngBuf, { filename: 'leaf.png', contentType: 'image/png' })
      .expect(200);
    assert.equal(segRes.body.status, 'DATASET_REQUIRED');

    // Severity status
    const sevRes = await request(app)
      .post('/api/detections/predict/severity')
      .attach('image', pngBuf, { filename: 'leaf.png', contentType: 'image/png' })
      .expect(200);
    assert.equal(sevRes.body.status, 'SEVERITY_NOT_AVAILABLE');

    // Multiple disease status
    const multRes = await request(app)
      .post('/api/detections/predict/multiple')
      .attach('image', pngBuf, { filename: 'leaf.png', contentType: 'image/png' })
      .expect(200);
    assert.equal(multRes.body.status, 'DATASET_REQUIRED');
  } finally {
    axios.post = originalPost;
  }
});

test('Phase 4: disease guidance endpoint returns verified university extension facts', async () => {
  const res = await request(app)
    .get('/api/diseases/guidance')
    .query({ plant: 'Tomato', disease: 'Early Blight' })
    .expect(200);

  assert.equal(res.body.success, true);
  assert.equal(res.body.guidance.plant, 'Tomato');
  assert.equal(res.body.guidance.disease, 'Early Blight');
  assert.equal(res.body.guidance.diseaseCategory, 'fungal');
  assert.ok(Array.isArray(res.body.guidance.sources));
  assert.ok(res.body.guidance.sources.length >= 1);
  assert.ok(res.body.guidance.sources[0].url.startsWith('https://'));
});

test('Phase 4: authenticated RAG chat maintains conversation history in MongoDB', async () => {
  const originalPost = axios.post;
  axios.post = async (url, payload) => {
    if (url.includes('/api/chat')) {
      return {
        data: {
          success: true,
          reply: 'Apply Bacillus subtilis or copper soap for Tomato Early Blight.',
          mode: 'verified_knowledge_retrieval',
          engine: 'AgroBloom Agricultural Knowledge Base',
          sources: [{ title: 'UC Davis IPM', organization: 'UC Davis', url: 'https://ipm.ucanr.edu' }],
          groundedData: { plant: 'Tomato', disease: 'Early Blight' },
          isUncertain: false
        }
      };
    }
    return originalPost(url, payload);
  };

  try {
    const chatRes = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        message: 'How do I treat Tomato Early Blight organically?',
        language: 'en',
        context: { selectedPlant: 'Tomato', prediction: 'Tomato Early Blight' }
      })
      .expect(200);

    assert.equal(chatRes.body.success, true);
    assert.ok(chatRes.body.reply.includes('Bacillus subtilis'));
    assert.ok(chatRes.body.conversationId);

    const historyRes = await request(app)
      .get(`/api/chat/history/${chatRes.body.conversationId}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    assert.equal(historyRes.body.success, true);
    assert.equal(historyRes.body.messages.length, 2);
    assert.equal(historyRes.body.messages[0].sender, 'user');
    assert.equal(historyRes.body.messages[1].sender, 'assistant');
    assert.equal(historyRes.body.messages[1].mode, 'verified_knowledge_retrieval');
  } finally {
    axios.post = originalPost;
  }
});

test('Phase 4: plant recovery monitoring supports timeline and progress tracking', async () => {
  const originalPost = axios.post;
  axios.post = async (url) => {
    if (url.includes('/recovery/analyze')) {
      return {
        data: {
          success: true,
          symptomStatus: 'Improving',
          trendSummary: 'Foliar pathology confidence reduced by 12%',
          visualMetrics: { visualDifferenceIndex: 0.042, greenIndexDelta: 0.015 }
        }
      };
    }
    return { data: { success: true } };
  };

  try {
    const pngBuf = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/S6sAAAAASUVORK5CYII=', 'base64');
    
    // Create recovery project
    const createRes = await request(app)
      .post('/api/recovery')
      .set('Authorization', `Bearer ${testToken}`)
      .attach('image', pngBuf, { filename: 'base.png', contentType: 'image/png' })
      .field('plantName', 'Tomato')
      .field('diseaseName', 'Early Blight')
      .field('notes', 'Initial diagnosis')
      .expect(201);

    assert.equal(createRes.body.success, true);
    const recId = createRes.body.record._id;
    assert.ok(recId);

    // Upload follow-up observation
    const followRes = await request(app)
      .post(`/api/recovery/${recId}/images`)
      .set('Authorization', `Bearer ${testToken}`)
      .attach('image', pngBuf, { filename: 'follow.png', contentType: 'image/png' })
      .field('notes', 'Day 5 follow-up after neem spray')
      .field('treatmentApplied', 'Neem oil spray')
      .expect(201);

    assert.equal(followRes.body.success, true);
    assert.ok(followRes.body.observation);
    assert.ok(followRes.body.varianceWarning);

    // Get progress summary
    const progRes = await request(app)
      .get(`/api/recovery/${recId}/progress`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    assert.equal(progRes.body.success, true);
    assert.equal(progRes.body.record.plantName, 'Tomato');
    assert.equal(progRes.body.timeline.length, 2);
    assert.ok(progRes.body.comparison.beforeImageUrl);
    assert.ok(progRes.body.comparison.currentImageUrl);
    assert.ok(progRes.body.varianceWarning);
  } finally {
    axios.post = originalPost;
  }
});

test('Phase 4: personalized plant care plan supports checklist task toggle', async () => {
  const planRes = await request(app)
    .post('/api/care-plans')
    .set('Authorization', `Bearer ${testToken}`)
    .send({
      plantName: 'Tomato',
      diseaseName: 'Early Blight',
      notes: 'Custom care plan for backyard tomatoes'
    })
    .expect(201);

  assert.equal(planRes.body.success, true);
  const plan = planRes.body.plan;
  assert.equal(plan.plantName, 'Tomato');
  assert.ok(plan.tasks.length >= 2);
  assert.equal(plan.tasks[0].isCompleted, false);

  // Toggle first task completion
  const toggleRes = await request(app)
    .patch(`/api/care-plans/${plan._id}/tasks/0`)
    .set('Authorization', `Bearer ${testToken}`)
    .expect(200);

  assert.equal(toggleRes.body.success, true);
  assert.equal(toggleRes.body.task.isCompleted, true);
  assert.ok(toggleRes.body.task.completedAt);
});

test('Phase 4: nutrient deficiency endpoints enforce DATASET_REQUIRED without fake results', async () => {
  // Status check
  const statusRes = await request(app)
    .get('/api/detections/nutrient/status')
    .expect(200);

  assert.equal(statusRes.body.status, 'DATASET_REQUIRED');
  assert.equal(statusRes.body.modelReady, false);

  // Prediction check with dummy image
  const originalPost = axios.post;
  axios.post = async (url, formData) => {
    await new Promise((resolve, reject) => {
      formData.once('end', resolve);
      formData.once('error', reject);
      formData.resume();
    });
    const err = new Error('MODEL_NOT_READY');
    err.response = {
      status: 503,
      data: {
        detail: {
          error: 'MODEL_NOT_READY',
          status: 'DATASET_REQUIRED',
          message: 'Nutrient deficiency diagnostic model is not ready.',
          diagnosticAdvisory: 'Laboratory foliar tissue testing is required.'
        }
      }
    };
    throw err;
  };

  try {
    const pngBuf = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/S6sAAAAASUVORK5CYII=', 'base64');
    const predRes = await request(app)
      .post('/api/detections/nutrient')
      .set('Authorization', `Bearer ${testToken}`)
      .attach('image', pngBuf, { filename: 'leaf.png', contentType: 'image/png' })
      .expect(503);

    assert.equal(predRes.body.status, 'DATASET_REQUIRED');
    assert.equal(predRes.body.error, 'MODEL_NOT_READY');
    assert.ok(predRes.body.diagnosticAdvisory);
  } finally {
    axios.post = originalPost;
  }
});

test('Phase 5: community post supports isSolved toggle by author', async () => {
  const post = await Post.create({
    author: testUserId,
    title: 'How to manage tomato early blight organically?',
    content: 'Observing concentric rings on lower leaves after rain.',
    category: 'Crops'
  });

  assert.equal(post.isSolved, false);

  const toggleRes = await request(app)
    .patch(`/api/community/posts/${post._id}/solve`)
    .set('Authorization', `Bearer ${testToken}`)
    .expect(200);

  assert.equal(toggleRes.body.success, true);
  assert.equal(toggleRes.body.isSolved, true);

  const updated = await Post.findById(post._id);
  assert.equal(updated.isSolved, true);
});

test('Phase 5: expert consultation workflow supports ticket submission and prescription', async () => {
  const consultRes = await request(app)
    .post('/api/consultations')
    .set('Authorization', `Bearer ${testToken}`)
    .field('cropOrFlowerName', 'Tomato (Arka Rakshak)')
    .field('symptomsDescription', 'Concentric target spots and yellow halos.')
    .field('urgency', 'High')
    .expect(201);

  assert.equal(consultRes.body.success, true);
  const ticketId = consultRes.body.consultation._id;

  const respondRes = await request(app)
    .patch(`/api/consultations/${ticketId}/respond`)
    .set('Authorization', `Bearer ${testToken}`)
    .send({
      expertNotes: 'Confirmed Alternaria solani early blight. High foliar risk.',
      status: 'Resolved',
      prescription: {
        medicinesOrSprays: ['Copper Hydroxide 77% WP @ 2.5g/L', 'Neem Oil 1500ppm'],
        instructions: 'Spray during morning hours. Ensure underside coverage.'
      }
    })
    .expect(200);

  assert.equal(respondRes.body.success, true);
  assert.equal(respondRes.body.consultation.status, 'Resolved');
  assert.equal(respondRes.body.consultation.prescription.medicinesOrSprays.length, 2);
});

test('Phase 5: PDF pathology report generates valid PDF document buffer', async () => {
  const detection = await Detection.create({
    user: testUserId,
    plantType: 'crop',
    plantName: 'Tomato',
    condition: 'diseased',
    primaryDisease: 'Early Blight',
    confidence: 96.8,
    modelUsed: 'MobileNetV2',
    originalImageUrl: '/uploads/test-tomato.png',
    recommendations: {
      organic: ['Apply Bacillus subtilis', 'Remove infected lower foliage'],
      chemical: ['Copper fungicide spray'],
      prevention: ['Crop rotation 3-4 years']
    }
  });

  const pdfRes = await request(app)
    .get(`/api/reports/${detection._id}/pdf`)
    .set('Authorization', `Bearer ${testToken}`)
    .expect('Content-Type', 'application/pdf')
    .expect(200);

  assert.ok(pdfRes.body.length > 500, 'PDF buffer should be non-empty');
  assert.ok(pdfRes.headers['content-disposition'].includes('AgroBloom_Pathology_Report'));
});

test('Phase 5: in-app notification center supports sync, unread count, read toggle, and preferences', async () => {
  // Sync reminders
  const syncRes = await request(app)
    .post('/api/notifications/sync-reminders')
    .set('Authorization', `Bearer ${testToken}`)
    .expect(200);

  assert.equal(syncRes.body.success, true);
  assert.ok(typeof syncRes.body.createdCount === 'number');

  // Create a direct test notification
  const Notification = require('../models/Notification');
  const testNotif = await Notification.create({
    user: testUserId,
    title: 'Test Care Reminder',
    message: 'Time to spray bio-fungicide',
    type: 'care_reminder',
    isRead: false
  });

  // Get unread count
  const countRes = await request(app)
    .get('/api/notifications/unread-count')
    .set('Authorization', `Bearer ${testToken}`)
    .expect(200);

  assert.equal(countRes.body.success, true);
  assert.ok(countRes.body.unreadCount >= 1);

  // Mark single as read
  const readRes = await request(app)
    .patch(`/api/notifications/${testNotif._id}/read`)
    .set('Authorization', `Bearer ${testToken}`)
    .expect(200);

  assert.equal(readRes.body.success, true);
  assert.equal(readRes.body.notification.isRead, true);

  // Get preferences and update
  const prefRes = await request(app)
    .put('/api/notifications/preferences')
    .set('Authorization', `Bearer ${testToken}`)
    .send({
      careReminders: true,
      followUpInspections: true,
      recoveryAlerts: true,
      browserAlerts: true,
      preferredLanguage: 'kn'
    })
    .expect(200);

  assert.equal(prefRes.body.success, true);
  assert.equal(prefRes.body.preferences.browserAlerts, true);
  assert.equal(prefRes.body.preferredLanguage, 'kn');
});

test('Phase 5: smart plant and disease search supports keyword search, suggestions, and pagination', async () => {
  // Suggestions mode
  const suggestRes = await request(app)
    .get('/api/diseases/search?q=Tomato&suggest=true')
    .expect(200);

  assert.equal(suggestRes.body.success, true);
  assert.ok(Array.isArray(suggestRes.body.suggestions));

  // Full search query
  const searchRes = await request(app)
    .get('/api/diseases/search?q=blight&page=1&limit=5')
    .expect(200);

  assert.equal(searchRes.body.success, true);
  assert.ok(Array.isArray(searchRes.body.results));
  assert.equal(searchRes.body.page, 1);
  assert.ok(searchRes.body.totalPages >= 1);
});

test('Phase 5: detection history supports search, category filtering, and pagination', async () => {
  const historyRes = await request(app)
    .get('/api/detections/history?plantType=crop&page=1&limit=10')
    .set('Authorization', `Bearer ${testToken}`)
    .expect(200);

  assert.equal(historyRes.body.success, true);
  assert.ok(Array.isArray(historyRes.body.detections));
  assert.equal(historyRes.body.page, 1);
  assert.ok(historyRes.body.totalPages >= 1);
});

test('Phase 6: community post edit, delete, and comments with nested replies', async () => {
  // 1. Create a post
  const postRes = await request(app)
    .post('/api/community/posts')
    .set('Authorization', `Bearer ${testToken}`)
    .send({
      title: 'How to manage Powdery Mildew on Apple?',
      content: 'Noticed white talcum-like coating on newer foliage.',
      category: 'Crop Diseases',
      plantType: 'Apple'
    })
    .expect(201);

  assert.equal(postRes.body.success, true);
  const postId = postRes.body.post._id;

  // 2. Edit own post
  const editRes = await request(app)
    .patch(`/api/community/posts/${postId}`)
    .set('Authorization', `Bearer ${testToken}`)
    .send({
      title: 'How to manage Powdery Mildew on Apple Orchards?',
      content: 'Updated description: leaves are curling upward.'
    })
    .expect(200);

  assert.equal(editRes.body.success, true);
  assert.equal(editRes.body.post.title, 'How to manage Powdery Mildew on Apple Orchards?');

  // 3. Add root comment
  const commentRes = await request(app)
    .post(`/api/community/posts/${postId}/comments`)
    .set('Authorization', `Bearer ${testToken}`)
    .send({ text: 'Apply wettable sulfur at 2g/L or potassium bicarbonate.' })
    .expect(201);

  assert.equal(commentRes.body.success, true);
  const rootCommentId = commentRes.body.comments[0]._id;

  // 4. Add nested reply to comment
  const replyRes = await request(app)
    .post(`/api/community/posts/${postId}/comments`)
    .set('Authorization', `Bearer ${testToken}`)
    .send({
      text: 'Make sure not to spray sulfur if temperatures exceed 30°C.',
      parentCommentId: rootCommentId
    })
    .expect(201);

  assert.equal(replyRes.body.success, true);
  assert.equal(replyRes.body.comments.length, 2);
  assert.equal(replyRes.body.comments[1].parentCommentId.toString(), rootCommentId.toString());

  // 5. Delete reply comment
  const replyId = replyRes.body.comments[1]._id;
  const delCommentRes = await request(app)
    .delete(`/api/community/comments/${replyId}`)
    .set('Authorization', `Bearer ${testToken}`)
    .expect(200);

  assert.equal(delCommentRes.body.success, true);
});

test('Phase 6: community reactions enforce single reaction per user and accepted answer', async () => {
  const post = await Post.create({
    author: testUserId,
    title: 'Rose Leaf Black Spot Treatment Discussion',
    content: 'Leaves turning yellow with circular black spots.',
    category: 'Flower Diseases',
    comments: [
      {
        user: testUserId,
        text: 'Sanitize fallen leaves and spray neem oil extract.',
        isAccepted: false
      }
    ]
  });

  const commentId = post.comments[0]._id;

  // 1. React helpful on post
  const react1 = await request(app)
    .post('/api/community/reactions')
    .set('Authorization', `Bearer ${testToken}`)
    .send({ targetType: 'post', targetId: post._id, reactionType: 'helpful' })
    .expect(201);

  assert.equal(react1.body.success, true);
  assert.equal(react1.body.reacted, true);

  // 2. Reacting again toggles/removes reaction
  const react2 = await request(app)
    .post('/api/community/reactions')
    .set('Authorization', `Bearer ${testToken}`)
    .send({ targetType: 'post', targetId: post._id, reactionType: 'helpful' })
    .expect(200);

  assert.equal(react2.body.success, true);
  assert.equal(react2.body.reacted, false);

  // 3. Mark accepted answer
  const acceptRes = await request(app)
    .patch(`/api/community/posts/${post._id}/accept-answer/${commentId}`)
    .set('Authorization', `Bearer ${testToken}`)
    .expect(200);

  assert.equal(acceptRes.body.success, true);
  assert.equal(acceptRes.body.isSolved, true);
  assert.equal(acceptRes.body.acceptedAnswerId.toString(), commentId.toString());

  // Verify in database
  const updatedPost = await Post.findById(post._id);
  assert.equal(updatedPost.comments[0].isAccepted, true);
});

test('Phase 6: expert application workflow, admin verification, and role upgrade', async () => {
  const jwt = require('jsonwebtoken');

  // Create an applicant user
  const applicantEmail = `applicant.${Date.now()}@agrobloom.com`;
  const applicant = await User.create({
    name: 'Dr. Agronomist Applicant',
    email: applicantEmail,
    password: 'password123',
    role: 'farmer'
  });

  const applicantToken = jwt.sign({ id: applicant._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  // Create an admin user
  const admin = await User.create({
    name: 'Platform Admin',
    email: `admin.${Date.now()}@agrobloom.com`,
    password: 'password123',
    role: 'admin'
  });

  const adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  // 1. Submit application
  const applyRes = await request(app)
    .post('/api/experts/applications')
    .set('Authorization', `Bearer ${applicantToken}`)
    .field('specialization', 'Horticultural Pathology & Integrated Pest Management')
    .field('qualifications', 'Ph.D. Plant Protection, UAS Bangalore')
    .field('experienceYears', 8)
    .field('bio', 'Specializing in solanaceous crop diseases and bio-fungicides.')
    .expect(201);

  assert.equal(applyRes.body.success, true);
  const appId = applyRes.body.application._id;

  // 2. Admin inspects application queue
  const queueRes = await request(app)
    .get('/api/admin/experts/applications?status=Pending')
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);

  assert.equal(queueRes.body.success, true);
  assert.ok(queueRes.body.applications.length >= 1);

  // 3. Admin approves verification application
  const verifyRes = await request(app)
    .post(`/api/admin/experts/${appId}/verify`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ approved: true, adminNotes: 'Verified university credentials and credentials' })
    .expect(200);

  assert.equal(verifyRes.body.success, true);

  // 4. Verify applicant was promoted to expert role
  const promotedUser = await User.findById(applicant._id);
  assert.equal(promotedUser.role, 'expert');

  // 5. Verify expert appears in public directory
  const dirRes = await request(app)
    .get('/api/experts')
    .expect(200);

  assert.equal(dirRes.body.success, true);
  assert.ok(dirRes.body.experts.some(e => e.user._id.toString() === applicant._id.toString()));

  // Cleanup
  await User.deleteMany({ _id: { $in: [applicant._id, admin._id] } });
  const ExpertApplication = require('../models/ExpertApplication');
  const ExpertProfile = require('../models/ExpertProfile');
  await ExpertApplication.deleteMany({ applicant: applicant._id });
  await ExpertProfile.deleteMany({ user: applicant._id });
});

test('Phase 6: consultation multi-turn messaging, status transitions, and content reporting', async () => {
  const jwt = require('jsonwebtoken');

  // Create expert user
  const expertUser = await User.create({
    name: 'Verified Agronomist',
    email: `expert.${Date.now()}@agrobloom.com`,
    password: 'password123',
    role: 'expert'
  });
  const expertToken = jwt.sign({ id: expertUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  // 1. Farmer creates consultation request assigned to expert
  const consultRes = await request(app)
    .post('/api/consultations')
    .set('Authorization', `Bearer ${testToken}`)
    .field('cropOrFlowerName', 'Tomato (Hybrid)')
    .field('symptomsDescription', 'Water-soaked spots on foliage and stem lesions.')
    .field('urgency', 'High')
    .field('expertId', expertUser._id.toString())
    .expect(201);

  assert.equal(consultRes.body.success, true);
  const ticketId = consultRes.body.consultation._id;
  assert.equal(consultRes.body.consultation.status, 'Assigned');

  // 2. Expert sends a message in consultation thread
  const msgRes = await request(app)
    .post(`/api/consultations/${ticketId}/messages`)
    .set('Authorization', `Bearer ${expertToken}`)
    .send({ message: 'Are these symptoms appearing after recent rainfall or sprinkler irrigation?' })
    .expect(201);

  assert.equal(msgRes.body.success, true);
  assert.equal(msgRes.body.messages.length, 2); // Initial symptom + expert question

  // 3. Farmer updates ticket status to Resolved
  const statusRes = await request(app)
    .patch(`/api/consultations/${ticketId}/status`)
    .set('Authorization', `Bearer ${testToken}`)
    .send({ status: 'Resolved' })
    .expect(200);

  assert.equal(statusRes.body.success, true);
  assert.equal(statusRes.body.status, 'Resolved');

  // 4. Submit content report
  const reportRes = await request(app)
    .post('/api/community/reports')
    .set('Authorization', `Bearer ${testToken}`)
    .send({
      targetType: 'consultation',
      targetId: ticketId,
      reason: 'Misleading Agricultural Advice',
      details: 'Follow-up question test'
    })
    .expect(201);

  assert.equal(reportRes.body.success, true);

  // Cleanup
  await User.deleteOne({ _id: expertUser._id });
  const Consultation = require('../models/Consultation');
  await Consultation.deleteOne({ _id: ticketId });
});

test('Phase 7/8: model comparison, versions, and offline manifest endpoints', async () => {
  // 1. Comparison endpoint
  const compRes = await request(app)
    .get('/api/models/comparison')
    .expect(200);

  assert.equal(compRes.body.success, true);
  assert.ok(compRes.body.architectures.includes('mobilenetv2'));
  assert.ok(compRes.body.crops.models.mobilenetv2);
  assert.ok(compRes.body.flowers.models.mobilenetv2);

  // 2. Versions endpoint
  const verRes = await request(app)
    .get('/api/models/versions')
    .expect(200);

  assert.equal(verRes.body.success, true);
  assert.equal(verRes.body.productionModel.architecture, 'MobileNetV2');
  assert.equal(verRes.body.benchmarkedArchitectures.length, 3);
  assert.equal(verRes.body.browserOfflineEngine.library, '@tensorflow/tfjs');

  // 3. Offline manifest
  const manifestRes = await request(app)
    .get('/api/models/offline-manifest')
    .expect(200);

  assert.equal(manifestRes.body.success, true);
  assert.ok(manifestRes.body.assets.length >= 3);
});

test('Phase 7/8: offline detection batch synchronization with duplicate prevention', async () => {
  const offlineRecords = [
    {
      clientLocalId: 'offline-001',
      plantType: 'crop',
      plantName: 'Tomato',
      primaryDisease: 'Early Blight',
      condition: 'diseased',
      confidence: 88.5,
      timestamp: new Date().toISOString(),
      topPredictions: [
        { label: 'Tomato - Early Blight', confidence: 88.5 }
      ],
      advice: {
        organic: ['Copper spray'],
        chemical: ['Mancozeb'],
        prevention: ['Crop rotation']
      }
    },
    {
      clientLocalId: 'offline-002',
      plantType: 'flower',
      plantName: 'Rose',
      primaryDisease: 'Black Spot',
      condition: 'diseased',
      confidence: 91.2,
      timestamp: new Date().toISOString(),
      topPredictions: [
        { label: 'Rose - Black Spot', confidence: 91.2 }
      ],
      advice: {
        organic: ['Neem oil'],
        chemical: ['Trifloxystrobin'],
        prevention: ['Sanitation']
      }
    }
  ];

  // First sync: both records should be synced
  const syncRes1 = await request(app)
    .post('/api/detections/offline-sync')
    .set('Authorization', `Bearer ${testToken}`)
    .send({ records: offlineRecords })
    .expect(201);

  assert.equal(syncRes1.body.success, true);
  assert.equal(syncRes1.body.syncedCount, 2);
  assert.equal(syncRes1.body.skippedCount, 0);

  // Second sync with same records: both should be skipped as duplicates
  const syncRes2 = await request(app)
    .post('/api/detections/offline-sync')
    .set('Authorization', `Bearer ${testToken}`)
    .send({ records: offlineRecords })
    .expect(201);

  assert.equal(syncRes2.body.success, true);
  assert.equal(syncRes2.body.syncedCount, 0);
  assert.equal(syncRes2.body.skippedCount, 2);

  // Clean up synced test records
  const Detection = require('../models/Detection');
  await Detection.deleteMany({ _id: { $in: syncRes1.body.syncedIds } });
});





