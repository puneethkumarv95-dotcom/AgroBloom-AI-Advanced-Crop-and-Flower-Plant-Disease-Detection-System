const mongoose = require('mongoose');

const recoveryEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  imageUrl: {
    type: String,
    required: true
  },
  severityPercentage: {
    type: Number,
    required: true
  },
  severityLevel: {
    type: String,
    enum: ['None', 'Mild', 'Moderate', 'Severe'],
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  treatmentApplied: {
    type: String,
    default: ''
  }
});

const recoveryTimelineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    plantName: {
      type: String,
      required: true
    },
    diseaseName: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Active Treatment', 'Recovering', 'Fully Recovered', 'Critical'],
      default: 'Active Treatment'
    },
    entries: [recoveryEntrySchema],
    recoveryScore: {
      type: Number,
      default: 0 // -100 to +100 recovery index
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecoveryTimeline', recoveryTimelineSchema);

