const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { optionalAuth, protect } = require('../middleware/auth');
const {
  diagnoseLeaf,
  diagnoseCrop,
  diagnoseFlower,
  explainGradCam,
  segmentDisease,
  predictSeverity,
  predictMultiple,
  detectUnknown,
  getHistory,
  getDetectionById,
  getModelStatus,
  deleteDetection,
  getNutrientStatus,
  predictNutrient,
  syncOfflineDetections
} = require('../controllers/detection.controller');

// Offline Detection Synchronization (Phase 7/8)
router.post('/offline-sync', protect, syncOfflineDetections);

// Model Telemetry & Status
router.get('/models/status', getModelStatus);

// Crop Disease Detection Endpoint
router.post('/crop', optionalAuth, upload.single('image'), diagnoseCrop);

// Flower Disease Detection Endpoint
router.post('/flower', optionalAuth, upload.single('image'), diagnoseFlower);

// Unified upload leaf and run real diagnosis
router.post('/diagnose', optionalAuth, upload.single('image'), diagnoseLeaf);

// Phase 3 Advanced Computer Vision & XAI
router.post('/explain/gradcam', optionalAuth, upload.single('image'), explainGradCam);
router.post('/segment/disease', optionalAuth, upload.single('image'), segmentDisease);
router.post('/predict/severity', optionalAuth, upload.single('image'), predictSeverity);
router.post('/predict/multiple', optionalAuth, upload.single('image'), predictMultiple);
router.post('/detect/unknown', optionalAuth, upload.single('image'), detectUnknown);

// Phase 4 Nutrient Deficiency Detection
router.get('/nutrient/status', getNutrientStatus);
router.get('/nutrient-status', getNutrientStatus);
router.post('/nutrient', optionalAuth, upload.single('image'), predictNutrient);
router.post('/predict/nutrient', optionalAuth, upload.single('image'), predictNutrient);

// Detection history
router.get('/history', optionalAuth, getHistory);

// Single record
router.get('/:id', optionalAuth, getDetectionById);

// Delete record
router.delete('/:id', protect, deleteDetection);

module.exports = router;
