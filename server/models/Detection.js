const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    plantType: {
      type: String,
      enum: ['crop', 'flower', 'nutrient', 'general'],
      required: true
    },
    plantName: {
      type: String,
      required: true,
      trim: true
    },
    condition: {
      type: String,
      enum: ['healthy', 'diseased', 'nutrient_deficiency', 'unknown'],
      required: true
    },
    primaryDisease: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    topPredictions: [
      {
        label: { type: String, required: true },
        confidence: { type: Number, required: true },
        plant: { type: String },
        disease: { type: String }
      }
    ],
    multipleDiseases: [
      {
        disease: { type: String },
        confidence: { type: Number },
        region: { type: String }
      }
    ],
    severity: {
      percentage: { type: Number, default: null },
      level: {
        type: String,
        enum: ['Not assessed', 'None', 'Mild', 'Moderate', 'Severe'],
        default: 'Not assessed'
      },
      affectedAreaSquarePixels: { type: Number, default: null }
    },
    originalImageUrl: {
      type: String,
      required: true
    },
    gradCamImageUrl: {
      type: String,
      default: ''
    },
    segmentationMaskUrl: {
      type: String,
      default: ''
    },
    recommendations: {
      organic: [{ type: String }],
      chemical: [{ type: String }],
      cultural: [{ type: String }],
      prevention: [{ type: String }]
    },
    isOutOfDistribution: {
      type: Boolean,
      default: null
    },
    modelUsed: {
      type: String,
      default: 'MobileNetV2'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Detection', detectionSchema);
