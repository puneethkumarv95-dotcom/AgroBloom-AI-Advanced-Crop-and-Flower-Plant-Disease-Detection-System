const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const CareReminder = require('../models/CareReminder');
const Reminder = require('../models/Reminder');
const RecoveryRecord = require('../models/RecoveryRecord');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const { unreadOnly, limit = 20, page = 1 } = req.query;
    const filter = { user: req.user._id };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user._id, isRead: false })
    ]);

    res.json({
      success: true,
      notifications,
      total,
      unreadCount,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit) || 1
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', protect, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });
    res.json({ success: true, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', protect, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/notifications/preferences
router.get('/preferences', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationPreferences preferredLanguage');
    res.json({
      success: true,
      preferences: user.notificationPreferences || {
        careReminders: true,
        followUpInspections: true,
        recoveryAlerts: true,
        browserAlerts: false
      },
      preferredLanguage: user.preferredLanguage || 'en'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/notifications/preferences
router.put('/preferences', protect, async (req, res) => {
  try {
    const { careReminders, followUpInspections, recoveryAlerts, browserAlerts, preferredLanguage } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.notificationPreferences) {
      user.notificationPreferences = {};
    }

    if (careReminders !== undefined) user.notificationPreferences.careReminders = Boolean(careReminders);
    if (followUpInspections !== undefined) user.notificationPreferences.followUpInspections = Boolean(followUpInspections);
    if (recoveryAlerts !== undefined) user.notificationPreferences.recoveryAlerts = Boolean(recoveryAlerts);
    if (browserAlerts !== undefined) user.notificationPreferences.browserAlerts = Boolean(browserAlerts);
    if (preferredLanguage && ['en', 'kn', 'hi'].includes(preferredLanguage)) {
      user.preferredLanguage = preferredLanguage;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.notificationPreferences,
      preferredLanguage: user.preferredLanguage
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/notifications/sync-reminders
// Scans active CareReminders and Recovery records to generate persistent notifications without duplicates
router.post('/sync-reminders', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const prefs = user.notificationPreferences || { careReminders: true, followUpInspections: true, recoveryAlerts: true };

    let createdCount = 0;
    const now = new Date();
    const futureWindow = new Date(Date.now() + 48 * 60 * 60 * 1000); // next 48 hours

    if (prefs.careReminders) {
      // 1. Scan CareReminders
      const dueReminders = await CareReminder.find({
        user: req.user._id,
        isCompleted: false,
        dueDate: { $lte: futureWindow }
      });

      for (const r of dueReminders) {
        const existing = await Notification.findOne({
          user: req.user._id,
          relatedId: String(r._id),
          type: 'care_reminder'
        });

        if (!existing) {
          await Notification.create({
            user: req.user._id,
            title: `Care Task: ${r.taskType} for ${r.plantName}`,
            message: r.title + (r.notes ? ` - ${r.notes}` : ''),
            type: 'care_reminder',
            priority: r.dueDate < now ? 'high' : 'medium',
            relatedId: String(r._id),
            link: '/care-plan',
            scheduledFor: r.dueDate,
            metadata: {
              plantName: r.plantName,
              taskType: r.taskType
            }
          });
          createdCount++;
        }
      }

      // 2. Scan standard Reminders
      const stdReminders = await Reminder.find({
        user: req.user._id,
        isCompleted: false,
        dueDate: { $lte: futureWindow }
      });

      for (const r of stdReminders) {
        const existing = await Notification.findOne({
          user: req.user._id,
          relatedId: String(r._id),
          type: 'care_reminder'
        });

        if (!existing) {
          await Notification.create({
            user: req.user._id,
            title: `Reminder: ${r.taskType} - ${r.plantName}`,
            message: r.title,
            type: 'care_reminder',
            priority: r.dueDate < now ? 'high' : 'medium',
            relatedId: String(r._id),
            link: '/reminders',
            scheduledFor: r.dueDate,
            metadata: {
              plantName: r.plantName,
              taskType: r.taskType
            }
          });
          createdCount++;
        }
      }
    }

    if (prefs.recoveryAlerts) {
      // 3. Scan active recovery tracking for follow-up inspections
      const activeRecoveries = await RecoveryRecord.find({
        user: req.user._id,
        status: { $in: ['active', 'monitoring'] }
      });

      for (const rec of activeRecoveries) {
        const existing = await Notification.findOne({
          user: req.user._id,
          relatedId: String(rec._id),
          type: 'inspection'
        });

        if (!existing) {
          await Notification.create({
            user: req.user._id,
            title: `Follow-up Inspection: ${rec.plantName}`,
            message: `Check on ${rec.diseaseDiagnosed || 'plant recovery'} progress and log an updated leaf photograph.`,
            type: 'inspection',
            priority: 'medium',
            relatedId: String(rec._id),
            link: `/recovery?id=${rec._id}`,
            metadata: {
              plantName: rec.plantName,
              diseaseName: rec.diseaseDiagnosed
            }
          });
          createdCount++;
        }
      }
    }

    res.json({
      success: true,
      message: `Synchronized reminders successfully. ${createdCount} new notifications generated.`,
      createdCount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

