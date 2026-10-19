const express = require('express');
const router = express.Router();
const ContentReport = require('../models/ContentReport');
const ExpertApplication = require('../models/ExpertApplication');
const ExpertProfile = require('../models/ExpertProfile');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// Helper to notify user
const safeNotify = async (notificationData) => {
  try {
    if (notificationData.user) {
      await Notification.create(notificationData);
    }
  } catch (err) {
    console.warn('[Notification Trigger Warning]:', err.message);
  }
};

// GET /api/admin/community/reports (admin & moderator)
router.get('/community/reports', protect, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const filter = {};
    if (status !== 'all') filter.status = status;

    const reports = await ContentReport.find(filter)
      .populate('reporter', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/community/reports/:id (admin & moderator)
router.patch('/community/reports/:id', protect, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const { status, actionTaken } = req.body;
    const report = await ContentReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Content report not found' });
    }

    report.status = status || 'reviewed';
    report.reviewedBy = req.user._id;
    report.actionTaken = actionTaken || 'Reviewed by moderator';
    await report.save();

    // If action is to hide target content
    if (actionTaken === 'hide_post' && report.targetType === 'post') {
      await Post.findByIdAndUpdate(report.targetId, { status: 'hidden' });
    }

    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/experts/applications (admin only)
router.get('/experts/applications', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const applications = await ExpertApplication.find(filter)
      .populate('applicant', 'name email role farmLocation phone')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/experts/:id/verify (admin only)
router.post('/experts/:id/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const { approved, adminNotes } = req.body;
    const application = await ExpertApplication.findById(req.params.id)
      .populate('applicant');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Expert application not found' });
    }

    application.status = approved ? 'Approved' : 'Rejected';
    application.adminNotes = adminNotes || (approved ? 'Credentials verified' : 'Application declined');
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();

    if (approved) {
      // 1. Promote applicant user role to 'expert'
      await User.findByIdAndUpdate(application.applicant._id, { role: 'expert' });

      // 2. Create or update ExpertProfile
      await ExpertProfile.findOneAndUpdate(
        { user: application.applicant._id },
        {
          specialization: application.specialization,
          qualifications: [application.qualifications],
          experienceYears: application.experienceYears,
          bio: application.bio,
          isVerified: true,
          verifiedBy: req.user._id,
          verifiedAt: new Date()
        },
        { upsert: true, new: true }
      );

      // 3. Notify user
      await safeNotify({
        user: application.applicant._id,
        title: 'Expert Verification Approved!',
        message: 'Congratulations! Your agronomist credentials have been verified by administrators. You can now consult farmers.',
        type: 'system',
        priority: 'high',
        link: '/consultations'
      });
    } else {
      // Notify user of decline
      await safeNotify({
        user: application.applicant._id,
        title: 'Expert Verification Update',
        message: `Your expert verification application was not approved: ${application.adminNotes}`,
        type: 'system',
        priority: 'medium',
        link: '/consultations'
      });
    }

    res.json({
      success: true,
      message: `Expert application ${approved ? 'approved and role assigned' : 'declined'}.`,
      application
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

