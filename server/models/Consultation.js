const mongoose = require('mongoose');

const consultationMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

const consultationSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    detectionRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Detection',
      required: false
    },
    cropOrFlowerName: {
      type: String,
      required: true,
      trim: true
    },
    symptomsDescription: {
      type: String,
      required: true
    },
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In-Review', 'Responded', 'Resolved', 'Closed', 'Cancelled'],
      default: 'Pending',
      index: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    expertNotes: {
      type: String,
      default: ''
    },
    prescription: {
      medicinesOrSprays: [{ type: String }],
      instructions: { type: String, default: '' },
      followUpDate: { type: Date }
    },
    messages: [consultationMessageSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Consultation', consultationSchema);
