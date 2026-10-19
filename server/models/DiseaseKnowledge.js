const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  organization: { type: String, required: true },
  url: { type: String, required: true }
}, { _id: false });

const diseaseKnowledgeSchema = new mongoose.Schema({
  classKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  plant: {
    type: String,
    required: true,
    index: true
  },
  plantSpecies: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['crop', 'flower', 'nutrient'],
    required: true
  },
  disease: {
    type: String,
    required: true,
    index: true
  },
  diseaseCategory: {
    type: String,
    enum: ['fungal', 'bacterial', 'oomycete', 'viral', 'pest', 'healthy', 'nutrient_deficiency'],
    default: 'fungal'
  },
  causalAgent: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    enum: ['diseased', 'healthy', 'nutrient_deficiency'],
    default: 'diseased'
  },
  symptoms: {
    type: String,
    required: true
  },
  possibleCauses: {
    type: String,
    default: ''
  },
  conditions: {
    type: String,
    default: ''
  },
  severityRisk: {
    type: String,
    default: 'Moderate'
  },
  observationInterval: {
    type: String,
    default: 'Inspect foliage weekly.'
  },
  whenToConsultExpert: {
    type: String,
    default: ''
  },
  recommendations: {
    organic: [{ type: String }],
    chemical: [{ type: String }],
    cultural: [{ type: String }],
    prevention: [{ type: String }]
  },
  sources: [sourceSchema],
  lastReviewed: {
    type: String,
    default: '2026-03-20'
  },
  kn: {
    disease: { type: String },
    summary: { type: String },
    cure: { type: String }
  },
  hi: {
    disease: { type: String },
    summary: { type: String },
    cure: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('DiseaseKnowledge', diseaseKnowledgeSchema);

