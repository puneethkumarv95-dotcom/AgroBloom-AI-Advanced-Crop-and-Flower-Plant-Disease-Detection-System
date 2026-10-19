const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide disease name'],
      trim: true
    },
    pathogen: {
      type: String,
      required: [true, 'Please provide causal pathogen (fungus, bacterium, virus, etc.)'],
      trim: true
    },
    category: {
      type: String,
      enum: ['fungal', 'bacterial', 'viral', 'nutrient_deficiency', 'pest'],
      default: 'fungal'
    },
    symptoms: {
      type: String,
      required: true
    },
    severityRisk: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical'],
      default: 'Moderate'
    },
    recommendations: {
      organic: [{ type: String }],
      chemical: [{ type: String }],
      cultural: [{ type: String }],
      prevention: [{ type: String }]
    },
    hostPlants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plant'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Disease', diseaseSchema);

