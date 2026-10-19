const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Helper to notify user without throwing
const safeNotify = async (notificationData) => {
  try {
    if (notificationData.user) {
      await Notification.create(notificationData);
    }
  } catch (err) {
    console.warn('[Notification Trigger Warning]:', err.message);
  }
};

// GET /api/consultations
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin' || req.user.role === 'moderator') {
      // Staff can view all consultations
      query = {};
    } else if (req.user.role === 'expert') {
      query.$or = [{ expert: req.user._id }, { status: 'Pending' }];
    } else {
      query.farmer = req.user._id;
    }

    const consultations = await Consultation.find(query)
      .populate('farmer', 'name email phone farmLocation avatar')
      .populate('expert', 'name email avatar')
      .populate('detectionRef', 'plantName primaryDisease confidence condition originalImageUrl')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: consultations.length, consultations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/consultations
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { cropOrFlowerName, symptomsDescription, urgency, detectionRef, expertId } = req.body;
    if (!cropOrFlowerName || !cropOrFlowerName.trim()) {
      return res.status(400).json({ success: false, message: 'Crop or flower name is required' });
    }
    if (!symptomsDescription || !symptomsDescription.trim()) {
      return res.status(400).json({ success: false, message: 'Symptoms description is required' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const consultation = await Consultation.create({
      farmer: req.user._id,
      expert: expertId || null,
      cropOrFlowerName: cropOrFlowerName.trim(),
      symptomsDescription: symptomsDescription.trim(),
      urgency: urgency || 'Medium',
      detectionRef: detectionRef || null,
      imageUrl,
      status: expertId ? 'Assigned' : 'Pending',
      messages: [
        {
          sender: req.user._id,
          message: symptomsDescription.trim(),
          imageUrl,
          createdAt: new Date()
        }
      ]
    });

    // If an expert was selected directly, notify that expert
    if (expertId) {
      await safeNotify({
        user: expertId,
        title: 'New Consultation Request Assigned',
        message: `${req.user.name} submitted a ${urgency || 'Medium'} urgency consultation for ${cropOrFlowerName}.`,
        type: 'system',
        priority: urgency === 'Critical' || urgency === 'High' ? 'urgent' : 'high',
        link: `/consultations?id=${consultation._id}`
      });
    }

    res.status(201).json({ success: true, consultation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/consultations/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('farmer', 'name email phone farmLocation avatar')
      .populate('expert', 'name email avatar')
      .populate('detectionRef')
      .populate('messages.sender', 'name role avatar');

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation ticket not found' });
    }

    // Access control: only farmer, assigned expert, or staff can view private thread
    const isFarmer = consultation.farmer._id.toString() === req.user._id.toString();
    const isExpert = consultation.expert && consultation.expert._id.toString() === req.user._id.toString();
    const isAvailableExpert = req.user.role === 'expert' && consultation.status === 'Pending';
    const isStaff = ['admin', 'moderator'].includes(req.user.role);

    if (!isFarmer && !isExpert && !isAvailableExpert && !isStaff) {
      return res.status(403).json({ success: false, message: 'Private consultation thread accessible only to authorized participants' });
    }

    res.json({ success: true, consultation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/consultations/:id/messages
router.post('/:id/messages', protect, upload.single('image'), async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation ticket not found' });
    }

    const isFarmer = consultation.farmer.toString() === req.user._id.toString();
    const isExpert = consultation.expert && consultation.expert.toString() === req.user._id.toString();
    const isStaff = ['admin', 'moderator'].includes(req.user.role);

    // If unassigned and an expert responds, assign them!
    if (!consultation.expert && req.user.role === 'expert') {
      consultation.expert = req.user._id;
      consultation.status = 'In-Review';
    } else if (!isFarmer && !isExpert && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized to send messages in this consultation' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newMsg = {
      sender: req.user._id,
      message: message.trim(),
      imageUrl,
      createdAt: new Date()
    };

    consultation.messages.push(newMsg);
    if (req.user.role === 'expert' && consultation.status === 'Pending') {
      consultation.status = 'In-Review';
    }
    await consultation.save();

    // Notify the other party
    const recipientId = isFarmer ? consultation.expert : consultation.farmer;
    if (recipientId) {
      await safeNotify({
        user: recipientId,
        title: isFarmer ? 'Farmer Reply on Consultation' : 'Expert Agronomist Reply',
        message: `${req.user.name}: "${message.trim().substring(0, 45)}..."`,
        type: 'system',
        priority: 'high',
        link: `/consultations?id=${consultation._id}`
      });
    }

    const populated = await Consultation.findById(consultation._id)
      .populate('farmer', 'name email phone avatar')
      .populate('expert', 'name email avatar')
      .populate('messages.sender', 'name role avatar');

    res.status(201).json({ success: true, messages: populated.messages, consultation: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/consultations/:id/status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Assigned', 'In-Review', 'Responded', 'Resolved', 'Closed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid consultation status' });
    }

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation ticket not found' });
    }

    const isFarmer = consultation.farmer.toString() === req.user._id.toString();
    const isExpert = consultation.expert && consultation.expert.toString() === req.user._id.toString();
    const isStaff = ['admin', 'moderator'].includes(req.user.role);

    if (!isFarmer && !isExpert && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify ticket status' });
    }

    // Farmers can close or cancel; experts can set in-review or resolved
    consultation.status = status;
    await consultation.save();

    res.json({ success: true, status: consultation.status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/consultations/:id/respond
router.patch('/:id/respond', protect, async (req, res) => {
  try {
    const { expertNotes, prescription, status } = req.body;
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation ticket not found' });
    }

    consultation.expert = req.user._id;
    if (expertNotes) consultation.expertNotes = expertNotes;
    if (prescription) {
      consultation.prescription = {
        medicinesOrSprays: prescription.medicinesOrSprays || [],
        instructions: prescription.instructions || '',
        followUpDate: prescription.followUpDate || null
      };
    }
    consultation.status = status || 'Resolved';

    // Also push a summary message to conversation thread
    if (expertNotes) {
      consultation.messages.push({
        sender: req.user._id,
        message: `[Clinical Agronomic Prescription]: ${expertNotes}`,
        createdAt: new Date()
      });
    }

    await consultation.save();

    // Notify farmer of prescription
    await safeNotify({
      user: consultation.farmer,
      title: 'Agronomist Prescription Issued',
      message: `Dr. / Agronomist ${req.user.name} has prescribed a treatment plan for your ${consultation.cropOrFlowerName}.`,
      type: 'system',
      priority: 'urgent',
      link: `/consultations?id=${consultation._id}`
    });

    const populated = await Consultation.findById(consultation._id)
      .populate('farmer', 'name email phone')
      .populate('expert', 'name email');

    res.json({ success: true, consultation: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
