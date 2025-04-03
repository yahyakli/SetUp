import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

// Protect routes - verify token
const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add user info to request
      req.user = {
        id: decoded.id,
        // Add any other user properties from the token
        // that might be useful for the chat service
      };
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }
  
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
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