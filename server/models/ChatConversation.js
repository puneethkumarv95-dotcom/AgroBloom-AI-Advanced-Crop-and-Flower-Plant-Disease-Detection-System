const mongoose = require('mongoose');

const chatConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Plant Pathology Inquiry'
  },
  context: {
    selectedPlant: { type: String },
    prediction: { type: String },
    confidence: { type: Number },
    className: { type: String }
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ChatConversation', chatConversationSchema);

