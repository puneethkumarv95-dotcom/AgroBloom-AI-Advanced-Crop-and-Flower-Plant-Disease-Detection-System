const mongoose = require('mongoose');

const expertApplicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    specialization: {
      type: String,
      required: [true, 'Agricultural specialization is required'],
      trim: true
    },
    qualifications: {
      type: String,
      required: [true, 'Academic degrees or agronomy certifications are required'],
      trim: true
    },
    experienceYears: {
      type: Number,
      required: [true, 'Years of experience are required'],
      min: 0
    },
    bio: {
      type: String,
      default: '',
      trim: true
    },
    documentUrl: {
      type: String,
      default: '' // Private document reference for admin verification only
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true
    },
    adminNotes: {
      type: String,
      default: ''
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExpertApplication', expertApplicationSchema);

