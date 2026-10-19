const axios = require('axios');
const ChatConversation = require('../models/ChatConversation');
const ChatMessage = require('../models/ChatMessage');

exports.sendMessage = async (req, res) => {
  try {
    const { message, language, context, conversationId } = req.body;
    const aiUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a message' });
    }

    // Call AI RAG service
    let aiRes;
    try {
      aiRes = await axios.post(`${aiUrl}/api/chat`, {
        message,
        language: language || 'en',
        context: context || null
      }, { timeout: 15000 });
    } catch (err) {
      console.error('[AI Service Chat Proxy Error]:', err.message);
      return res.status(503).json({
        success: false,
        message: 'Plant pathology assistant is temporarily unavailable. Please try again shortly.'
      });
    }

    const { reply, mode, engine, sources, groundedData, isUncertain } = aiRes.data;

    let activeConversationId = conversationId;

    // Persist to MongoDB if user is authenticated
    if (req.user) {
      let conversation;
      if (activeConversationId) {
        conversation = await ChatConversation.findOne({
          _id: activeConversationId,
          user: req.user._id
        });
      }

      if (!conversation) {
        const titleSnippet = message.slice(0, 45) + (message.length > 45 ? '...' : '');
        conversation = await ChatConversation.create({
          user: req.user._id,
          title: context?.selectedPlant ? `${context.selectedPlant}: ${titleSnippet}` : titleSnippet,
          context: context || {}
        });
        activeConversationId = conversation._id;
      }

      // Save user message
      await ChatMessage.create({
        conversation: conversation._id,
        user: req.user._id,
        sender: 'user',
        text: message
      });

      // Save assistant message
      await ChatMessage.create({
        conversation: conversation._id,
        user: req.user._id,
        sender: 'assistant',
        text: reply,
        mode: mode || 'verified_knowledge_retrieval',
        engine: engine || 'AgroBloom Agricultural Knowledge Base',
        sources: sources || [],
        groundedData: groundedData || null,
        isUncertain: !!isUncertain
      });

      conversation.lastMessageAt = new Date();
      await conversation.save();
    }

    return res.json({
      success: true,
      reply,
      mode: mode || 'verified_knowledge_retrieval',
      engine: engine || 'AgroBloom Agricultural Knowledge Base',
      sources: sources || [],
      groundedData: groundedData || null,
      isUncertain: !!isUncertain,
      conversationId: activeConversationId
    });
  } catch (err) {
    console.error('[Chat Controller Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await ChatConversation.find({ user: req.user._id })
      .sort({ lastMessageAt: -1 })
      .limit(30);
    return res.json({ success: true, count: conversations.length, conversations });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const conversationId = req.params.conversationId || req.query.conversationId;
    let query = { user: req.user._id };

    if (conversationId) {
      query.conversation = conversationId;
    } else {
      // Find latest conversation
      const latestConv = await ChatConversation.findOne({ user: req.user._id }).sort({ lastMessageAt: -1 });
      if (!latestConv) {
        return res.json({ success: true, conversation: null, messages: [] });
      }
      query.conversation = latestConv._id;
    }

    const messages = await ChatMessage.find(query).sort({ createdAt: 1 });
    return res.json({ success: true, conversationId: query.conversation, messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const conv = await ChatConversation.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    await ChatMessage.deleteMany({ conversation: conv._id });
    return res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

