const mongoose = require('mongoose');

const careTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['organic', 'chemical', 'cultural', 'prevention', 'observation'],
    default: 'cultural'
  },
  frequency: {
    type: String,
    default: 'Daily'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
}, { _id: true });

const plantCarePlanSchema = new mongoose.Schema({
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
  diseaseName: {
    type: String,
    required: true
  },
  detection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Detection',
    default: null
  },
  tasks: [careTaskSchema],
  observationSchedule: {
    type: String,
    default: 'Inspect foliage every 3 to 5 days.'
  },
  expertAdvisory: {
    type: String,
    default: 'Consult local agricultural extension if symptoms spread beyond 25% of canopy.'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('PlantCarePlan', plantCarePlanSchema);

