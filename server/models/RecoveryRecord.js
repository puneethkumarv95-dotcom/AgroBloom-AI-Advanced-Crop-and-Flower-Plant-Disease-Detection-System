const mongoose = require('mongoose');

const recoveryRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  plantName: {
    type: String,
    required: true
  },
  plantType: {
    type: String,
    enum: ['crop', 'flower'],
    default: 'crop'
  },
  diseaseName: {
    type: String,
    required: true
  },
  initialDetection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Detection',
    default: null
  },
  initialImageUrl: {
    type: String,
    required: true
  },
  initialConfidence: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Under Observation', 'Improving', 'Stable', 'Worsening', 'Resolved'],
    default: 'Under Observation'
  },
  notes: {
    type: String,
    default: ''
  },
  lastObservationDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('RecoveryRecord', recoveryRecordSchema);

