const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatConversation',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ['verified_knowledge_retrieval', 'llm_augmented', 'system_advisory'],
    default: 'verified_knowledge_retrieval'
  },
  engine: {
    type: String,
    default: 'AgroBloom Agricultural Knowledge Base'
  },
  sources: [
    {
      title: { type: String },
      organization: { type: String },
      url: { type: String }
    }
  ],
  groundedData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  isUncertain: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);

