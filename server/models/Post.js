const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isAccepted: {
      type: Boolean,
      default: false
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'hidden'],
      default: 'active'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000
    },
    category: {
      type: String,
      enum: [
        'Crop Diseases',
        'Flower Diseases',
        'Plant Care',
        'Nutrient Deficiency',
        'Disease Prevention',
        'Recovery Experiences',
        'Organic Remedies',
        'Pest Control',
        'General Discussion',
        'Crops',
        'Flowers',
        'Nutrients'
      ],
      default: 'General Discussion',
      index: true
    },
    plantType: {
      type: String,
      default: ''
    },
    diseaseTag: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    detectionRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Detection',
      required: false
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    helpfulCount: {
      type: Number,
      default: 0,
      index: true
    },
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    isSolved: {
      type: Boolean,
      default: false,
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'hidden', 'reported'],
      default: 'active',
      index: true
    },
    reportCount: {
      type: Number,
      default: 0
    },
    comments: [commentSchema]
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('Post', postSchema);
