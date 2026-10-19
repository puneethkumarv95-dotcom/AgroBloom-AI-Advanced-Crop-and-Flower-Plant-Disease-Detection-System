const mongoose = require('mongoose');

const expertProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true
    },
    qualifications: [
      {
        type: String,
        trim: true
      }
    ],
    experienceYears: {
      type: Number,
      default: 1,
      min: 0
    },
    supportedCategories: [
      {
        type: String,
        enum: ['crop', 'flower', 'both', 'nutrient'],
        default: 'both'
      }
    ],
    supportedLanguages: [
      {
        type: String,
        default: 'en'
      }
    ],
    bio: {
      type: String,
      default: '',
      maxlength: 2000
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExpertProfile', expertProfileSchema);

