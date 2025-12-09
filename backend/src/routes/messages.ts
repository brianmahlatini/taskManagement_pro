import express from 'express';
import { protect } from '../middleware/auth';
import { getConversations, getMessages, sendMessage, deleteMessage, createConversation, getUsers, markMessagesAsRead } from '../controllers/messageController';

const router = express.Router();

router.use(protect);

// User routes - get available users to message
router.route('/users').get(getUsers);

// Conversation routes
router.route('/conversations').get(getConversations).post(createConversation);
router.route('/conversations/:conversationId/messages').get(getMessages).post(sendMessage);
router.route('/conversations/:conversationId/read').post(markMessagesAsRead);

// Message routes
router.route('/messages/:messageId').delete(deleteMessage);

export default router;