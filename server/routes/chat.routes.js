const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect, optionalAuth } = require('../middleware/auth');

// POST /api/chat - Send message (authenticated gets history, guest allowed)
router.post('/', optionalAuth, chatController.sendMessage);

// Backward compatibility: POST /api/chat/message
router.post('/message', optionalAuth, chatController.sendMessage);

// GET /api/chat/conversations - List user's conversations
router.get('/conversations', protect, chatController.getConversations);

// GET /api/chat/history - Get conversation history
router.get('/history', protect, chatController.getHistory);

// GET /api/chat/history/:conversationId - Get specific conversation history
router.get('/history/:conversationId', protect, chatController.getHistory);

// DELETE /api/chat/conversations/:id - Delete conversation
router.delete('/conversations/:id', protect, chatController.deleteConversation);

module.exports = router;
