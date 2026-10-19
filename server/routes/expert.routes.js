const express = require('express');
const router = express.Router();
const ExpertProfile = require('../models/ExpertProfile');
const ExpertApplication = require('../models/ExpertApplication');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/experts
router.get('/', async (req, res) => {
  try {
    const { category, language } = req.query;
    let query = { isVerified: true };

    if (category && category !== 'all' && category !== 'All') {
      query.supportedCategories = { $in: [category, 'both'] };
    }
    if (language && language !== 'all') {
      query.supportedLanguages = language;
    }

    const experts = await ExpertProfile.find(query)
      .populate('user', 'name email avatar role farmLocation')
      .sort({ experienceYears: -1 });

    res.json({ success: true, count: experts.length, experts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/experts/:id
router.get('/:id', async (req, res) => {
  try {
    const expert = await ExpertProfile.findById(req.params.id)
      .populate('user', 'name email avatar role farmLocation bio');

    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert profile not found' });
    }

    res.json({ success: true, expert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/experts/applications
router.post('/applications', protect, upload.single('document'), async (req, res) => {
  try {
    const { specialization, qualifications, experienceYears, bio } = req.body;

    if (!specialization || !specialization.trim()) {
      return res.status(400).json({ success: false, message: 'Specialization is required' });
    }
    if (!qualifications || !qualifications.trim()) {
      return res.status(400).json({ success: false, message: 'Qualifications are required' });
    }
    if (!experienceYears) {
      return res.status(400).json({ success: false, message: 'Years of agricultural experience are required' });
    }

    // Check if user already has pending application
    const existing = await ExpertApplication.findOne({
      applicant: req.user._id,
      status: 'Pending'
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have a verification application pending review by administrators.'
      });
    }

    let documentUrl = '';
    if (req.file) {
      documentUrl = `/uploads/${req.file.filename}`;
    }

    const application = await ExpertApplication.create({
      applicant: req.user._id,
      specialization: specialization.trim(),
      qualifications: qualifications.trim(),
      experienceYears: Number(experienceYears),
      bio: bio || '',
      documentUrl
    });

    res.status(201).json({
      success: true,
      message: 'Expert verification application submitted successfully. Administrators will review your credentials.',
      application
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/experts/applications/me
router.get('/applications/me', protect, async (req, res) => {
  try {
    const application = await ExpertApplication.findOne({ applicant: req.user._id })
      .sort({ createdAt: -1 });

    const profile = await ExpertProfile.findOne({ user: req.user._id });

    res.json({
      success: true,
      application,
      profile
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

