const mongoose = require('mongoose');

const recoveryObservationSchema = new mongoose.Schema({
  recoveryRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecoveryRecord',
    required: true,
    index: true
  },
  observationDate: {
    type: Date,
    default: Date.now
  },
  imageUrl: {
    type: String,
    required: true
  },
  predictedClass: {
    type: String,
    default: ''
  },
  confidence: {
    type: Number,
    default: 0
  },
  symptomStatus: {
    type: String,
    enum: ['Improving', 'Stable', 'Worsening', 'Indeterminate'],
    default: 'Stable'
  },
  trendSummary: {
    type: String,
    default: ''
  },
  visualDifferenceIndex: {
    type: Number,
    default: null
  },
  greenIndexDelta: {
    type: Number,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  treatmentApplied: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('RecoveryObservation', recoveryObservationSchema);

