<<<<<<< HEAD
import express from 'express';
import ChatController from '../controllers/chat.controller.js';
import authenticateJWT from '../middleware/authenticateJWT.js';
import validateRequest from '../middleware/validateRequest.js';
import { getConversationsQuerySchema, getMessagesQuerySchema, sendMessageSchema } from '../DTOs/chat.dto.js';
import { uploadSingleFile } from '../middleware/fileUpload.js';

const router = express.Router();
router.use(authenticateJWT);

// GET /api/chat/conversations
router.get('/conversations', validateRequest(getConversationsQuerySchema, 'query'), ChatController.getConversations);

// GET /api/chat/conversations/:conversation_id_or_uid/messages
router.get('/conversations/:conversation_id_or_uid/messages', validateRequest(getMessagesQuerySchema, 'query'), ChatController.getMessages);

// POST /api/chat/messages
router.post('/messages', validateRequest(sendMessageSchema, 'body'), ChatController.sendMessage);

// POST /api/chat/conversations/:conversation_id_or_uid/messages/read
router.post('/conversations/:conversation_id_or_uid/messages/read', ChatController.markConversationAsRead);

// POST /api/chat/conversations/:conversation_id_or_uid/messages/upload (file upload)
router.post('/conversations/:conversation_id_or_uid/messages/upload', uploadSingleFile('file'), ChatController.sendFileMessage);

=======
import express from 'express';
import ChatController from '../controllers/chat.controller.js';
import authenticateJWT from '../middleware/authenticateJWT.js';
import validateRequest from '../middleware/validateRequest.js';
import { getConversationsQuerySchema, getMessagesQuerySchema, sendMessageSchema } from '../DTOs/chat.dto.js';
import { uploadSingleFile } from '../middleware/fileUpload.js';

const router = express.Router();
router.use(authenticateJWT);

// GET /api/chat/conversations
router.get('/conversations', validateRequest(getConversationsQuerySchema, 'query'), ChatController.getConversations);

// GET /api/chat/conversations/:conversation_id_or_uid/messages
router.get('/conversations/:conversation_id_or_uid/messages', validateRequest(getMessagesQuerySchema, 'query'), ChatController.getMessages);

// POST /api/chat/messages
router.post('/messages', validateRequest(sendMessageSchema, 'body'), ChatController.sendMessage);

// POST /api/chat/conversations/:conversation_id_or_uid/messages/read
router.post('/conversations/:conversation_id_or_uid/messages/read', ChatController.markConversationAsRead);

// POST /api/chat/conversations/:conversation_id_or_uid/messages/upload (file upload)
router.post('/conversations/:conversation_id_or_uid/messages/upload', uploadSingleFile('file'), ChatController.sendFileMessage);

>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
export default router; 