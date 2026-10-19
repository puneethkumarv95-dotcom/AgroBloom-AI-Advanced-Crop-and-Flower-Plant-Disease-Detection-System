const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const RecoveryRecord = require('../models/RecoveryRecord');
const RecoveryObservation = require('../models/RecoveryObservation');
const RecoveryTimeline = require('../models/RecoveryTimeline');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const VARIANCE_WARNING = (
  "Foliar photographic comparison is sensitive to ambient lighting, camera exposure, " +
  "angle of incidence, distance, and day-to-day leaf turgor. Observed visual changes reflect " +
  "morphological indications and do not constitute a quantitative chemical or microbiological assay."
);

// GET /api/recovery - List user's recovery records
router.get('/', protect, async (req, res) => {
  try {
    const records = await RecoveryRecord.find({ user: req.user._id }).sort({ updatedAt: -1 });
    
    // Also attach observations count and latest observation
    const recordsWithDetails = await Promise.all(
      records.map(async (rec) => {
        const obs = await RecoveryObservation.find({ recoveryRecord: rec._id }).sort({ observationDate: -1 });
        return {
          ...rec.toObject(),
          observationsCount: obs.length,
          latestObservation: obs[0] || null
        };
      })
    );

    // Backward compatibility for existing timelines
    const timelines = await RecoveryTimeline.find({ user: req.user._id }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: recordsWithDetails.length,
      records: recordsWithDetails,
      timelines // backward compatibility
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/recovery - Create new recovery monitoring project
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { plantName, plantType, diseaseName, initialDetection, initialImageUrl, notes } = req.body;

    let imageUrl = initialImageUrl || '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!plantName || !diseaseName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both plantName and diseaseName.'
      });
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an initial leaf image or image URL.'
      });
    }

    const record = await RecoveryRecord.create({
      user: req.user._id,
      plantName,
      plantType: plantType || 'crop',
      diseaseName,
      initialDetection: initialDetection || null,
      initialImageUrl: imageUrl,
      notes: notes || '',
      status: 'Under Observation'
    });

    // Also create initial baseline observation
    await RecoveryObservation.create({
      recoveryRecord: record._id,
      observationDate: record.startDate,
      imageUrl,
      predictedClass: diseaseName,
      symptomStatus: 'Stable',
      trendSummary: 'Baseline observation established.',
      notes: notes || 'Baseline photographic diagnosis'
    });

    // Also mirror to legacy RecoveryTimeline for backwards compatibility
    await RecoveryTimeline.create({
      user: req.user._id,
      plantName,
      diseaseName,
      status: 'Active Treatment',
      entries: [{
        date: record.startDate,
        imageUrl,
        severityPercentage: 0,
        severityLevel: 'Moderate',
        notes: notes || 'Baseline'
      }]
    });

    res.status(201).json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/recovery/:id - Get specific recovery record with observations
router.get('/:id', protect, async (req, res) => {
  try {
    const record = await RecoveryRecord.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) {
      // Check legacy RecoveryTimeline
      const legacy = await RecoveryTimeline.findOne({ _id: req.params.id, user: req.user._id });
      if (legacy) {
        return res.json({ success: true, record: legacy, observations: legacy.entries });
      }
      return res.status(404).json({ success: false, message: 'Recovery record not found.' });
    }

    const observations = await RecoveryObservation.find({ recoveryRecord: record._id })
      .sort({ observationDate: 1 });

    res.json({
      success: true,
      record,
      observations,
      varianceWarning: VARIANCE_WARNING
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/recovery/:id/images - Upload follow-up image on a subsequent date
router.post('/:id/images', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please provide a follow-up image' });
    }

    const record = await RecoveryRecord.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Recovery record not found' });
    }

    const followupImageUrl = `/uploads/${req.file.filename}`;
    const { notes, treatmentApplied } = req.body;

    let symptomStatus = 'Stable';
    let trendSummary = 'Follow-up observation recorded.';
    let visualDiff = null;
    let greenDelta = null;

    // Optional comparative analysis with AI microservice if baseline image is local
    const aiUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
    try {
      const baselineLocalPath = path.join(__dirname, '..', record.initialImageUrl.replace(/^\//, ''));
      const followupLocalPath = req.file.path;

      if (fs.existsSync(baselineLocalPath) && fs.existsSync(followupLocalPath)) {
        const formData = new FormData();
        formData.append('baseline_image', fs.createReadStream(baselineLocalPath));
        formData.append('followup_image', fs.createReadStream(followupLocalPath));
        formData.append('plant_type', record.plantType || 'crop');

        const aiRes = await axios.post(`${aiUrl}/recovery/analyze`, formData, {
          headers: { ...formData.getHeaders() },
          timeout: 45000
        });

        if (aiRes.data && aiRes.data.success) {
          symptomStatus = aiRes.data.symptomStatus || 'Stable';
          trendSummary = aiRes.data.trendSummary || '';
          visualDiff = aiRes.data.visualMetrics?.visualDifferenceIndex || null;
          greenDelta = aiRes.data.visualMetrics?.greenIndexDelta || null;
        }
      }
    } catch (aiErr) {
      console.warn('[Recovery AI Analysis Warning]:', aiErr.message);
    }

    const observation = await RecoveryObservation.create({
      recoveryRecord: record._id,
      observationDate: new Date(),
      imageUrl: followupImageUrl,
      symptomStatus,
      trendSummary,
      visualDifferenceIndex: visualDiff,
      greenIndexDelta: greenDelta,
      notes: notes || '',
      treatmentApplied: treatmentApplied || ''
    });

    // Update overall record status
    record.status = symptomStatus === 'Improving' ? 'Improving'
      : symptomStatus === 'Worsening' ? 'Worsening'
      : record.status;
    record.lastObservationDate = new Date();
    await record.save();

    res.status(201).json({
      success: true,
      observation,
      recordStatus: record.status,
      varianceWarning: VARIANCE_WARNING
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/recovery/:id/progress - Comprehensive progress overview
router.get('/:id/progress', protect, async (req, res) => {
  try {
    const record = await RecoveryRecord.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Recovery record not found' });
    }

    const observations = await RecoveryObservation.find({ recoveryRecord: record._id })
      .sort({ observationDate: 1 });

    const latestObservation = observations[observations.length - 1] || null;

    res.json({
      success: true,
      record: {
        id: record._id,
        plantName: record.plantName,
        diseaseName: record.diseaseName,
        startDate: record.startDate,
        status: record.status,
        initialImageUrl: record.initialImageUrl
      },
      latestObservation: latestObservation ? {
        date: latestObservation.observationDate,
        imageUrl: latestObservation.imageUrl,
        symptomStatus: latestObservation.symptomStatus,
        trendSummary: latestObservation.trendSummary,
        notes: latestObservation.notes,
        treatmentApplied: latestObservation.treatmentApplied
      } : null,
      timeline: observations.map((o) => ({
        id: o._id,
        date: o.observationDate,
        imageUrl: o.imageUrl,
        status: o.symptomStatus,
        summary: o.trendSummary,
        notes: o.notes,
        treatment: o.treatmentApplied
      })),
      comparison: {
        beforeImageUrl: record.initialImageUrl,
        currentImageUrl: latestObservation ? latestObservation.imageUrl : record.initialImageUrl
      },
      varianceWarning: VARIANCE_WARNING
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Backward compatibility: POST /api/recovery/:id/entry
router.post('/:id/entry', protect, upload.single('image'), async (req, res) => {
  try {
    const { notes, treatmentApplied } = req.body;
    const timeline = await RecoveryTimeline.findOne({ _id: req.params.id, user: req.user._id });
    if (!timeline) return res.status(404).json({ success: false, message: 'Timeline not found' });

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    timeline.entries.push({
      date: new Date(),
      imageUrl,
      severityPercentage: 0,
      severityLevel: 'Moderate',
      notes: notes || '',
      treatmentApplied: treatmentApplied || ''
    });

    await timeline.save();
    res.status(201).json({ success: true, timeline });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
