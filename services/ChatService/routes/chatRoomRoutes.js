import express from 'express';
import {
  createChatRoom,
  getChatRooms,
  getChatRoomById,
  updateChatRoom,
  addParticipant,
  removeParticipant,
  deleteChatRoom
} from '../controllers/chatRoomController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createChatRoom)
  
router.get('/by-user/:userId', protect, getChatRooms);

router.route('/:id')
  .get(protect, getChatRoomById)
  .put(protect, updateChatRoom)
  .delete(protect, deleteChatRoom);

router.route('/:id/participants')
  .post(protect, addParticipant);

router.route('/:id/participants/:userId')
  .delete(protect, removeParticipant);

export default router;