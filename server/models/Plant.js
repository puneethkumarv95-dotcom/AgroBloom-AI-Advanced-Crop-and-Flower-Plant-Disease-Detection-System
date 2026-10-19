const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema(
  {
    commonName: {
      type: String,
      required: [true, 'Please provide plant common name'],
      trim: true
    },
    scientificName: {
      type: String,
      required: [true, 'Please provide botanical/scientific name'],
      trim: true
    },
    category: {
      type: String,
      enum: ['crop', 'flower', 'vegetable', 'fruit', 'ornamental'],
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    optimalTemperature: {
      min: { type: Number, default: 18 },
      max: { type: Number, default: 30 }
    },
    optimalSoilPh: {
      min: { type: Number, default: 6.0 },
      max: { type: Number, default: 7.0 }
    },
    commonDiseases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Disease'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plant', plantSchema);

