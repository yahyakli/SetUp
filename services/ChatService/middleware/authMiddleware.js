import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import ChatRoom from '../models/chatRoom.js';
import { ResponseHandler } from '../utils/responseHandler.js';

// Protect routes - verify token
const protect = asyncHandler(async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseHandler.error(res, 'Authorization token required', 401);
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, Buffer.from(process.env.JWT_SECRET, 'base64'));

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ResponseHandler.error(res, 'Token expired', 401);
    }

    return ResponseHandler.error(res, `Invalid token: ${error.message}`, 401);
  }
});

// Check if user is part of chat room
const isChatRoomParticipant = asyncHandler(async (req, res, next) => {
  const chatRoom = await ChatRoom.findById(req.params.id);

  if (!chatRoom) {
    res.status(404);
    throw new Error('Chat room not found');
  }

  if (!chatRoom.participants.includes(req.user.id)) {
    res.status(403);
    throw new Error('Not authorized, not a participant of this chat room');
  }

  next();
});

export { protect, isChatRoomParticipant };