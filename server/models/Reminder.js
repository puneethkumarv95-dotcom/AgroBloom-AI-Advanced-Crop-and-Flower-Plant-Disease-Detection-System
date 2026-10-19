const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    plantName: {
      type: String,
      required: true,
      trim: true
    },
    taskType: {
      type: String,
      enum: ['Watering', 'Fertilizer Application', 'Fungicide Spray', 'Pesticide Spray', 'Pruning', 'Observation', 'Harvesting'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    notes: {
      type: String,
      default: ''
    },
    dueDate: {
      type: Date,
      required: true
    },
    frequency: {
      type: String,
      enum: ['Once', 'Daily', 'Weekly', 'Biweekly', 'Monthly'],
      default: 'Once'
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', reminderSchema);

