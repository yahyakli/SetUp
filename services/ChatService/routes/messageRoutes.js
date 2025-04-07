import express from 'express';
import {
  createMessage,
  getMessagesByChatRoom,
  uploadAttachment,
  getAttachments,
  deleteAttachment,
  markMessagesAsRead,
  getPaginatedMessages,
  getMoreMessages
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Create message (now with optional file upload)
router.post('/', protect, upload.single('file'), createMessage);

// Get messages by chat room
router.get('/chat-room/:chatRoomId/:userId', protect, getMessagesByChatRoom);

// Get paginated messages
router.get('/paginated/:chatRoomId/:userId', protect, getPaginatedMessages);

// Get more messages based on last message ID
router.get('/more/:chatRoomId/:lastMessageId/:userId', protect, getMoreMessages);

// Mark messages as read
router.put('/read/:userId', protect, markMessagesAsRead);

// Upload attachment to message
router.post('/:messageId/attachments', protect, upload.single('file'), uploadAttachment);

// Get attachments for a message
router.get('/:messageId/attachments', protect, getAttachments);

// Delete attachment
router.delete('/attachments/:attachmentId', protect, deleteAttachment);

export default router;