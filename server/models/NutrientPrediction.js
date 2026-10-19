const mongoose = require('mongoose');

const nutrientPredictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  plantSpecies: {
    type: String,
    default: 'Unspecified'
  },
  status: {
    type: String,
    enum: ['DATASET_REQUIRED', 'MODEL_NOT_READY', 'PRELIMINARY_EVALUATION'],
    default: 'DATASET_REQUIRED'
  },
  suspectedDeficiency: {
    type: String,
    default: 'Foliar Chlorosis / Laboratory Soil Assay Required'
  },
  diagnosticAdvisory: {
    type: String,
    default: 'Visual symptoms alone cannot reliably distinguish mobile macronutrient deficiencies from root pathology. Certified laboratory tissue testing is required.'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('NutrientPrediction', nutrientPredictionSchema);

