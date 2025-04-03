import express from 'express';
import {
  createMessage,
  getMessagesByChatRoom,
  uploadAttachment,
  getAttachments,
  deleteAttachment,
  markMessagesAsRead
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Create message
router.post('/', protect, createMessage);

// Get messages by chat room
router.get('/chat-room/:chatRoomId', protect, getMessagesByChatRoom);

// Mark messages as read
router.put('/read', protect, markMessagesAsRead);

// Upload attachment to message
router.post('/:messageId/attachments', protect, upload.single('file'), uploadAttachment);

// Get attachments for a message
router.get('/:messageId/attachments', protect, getAttachments);

// Delete attachment
router.delete('/attachments/:attachmentId', protect, deleteAttachment);

export default router;