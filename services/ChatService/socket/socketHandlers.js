// Socket event handlers
const setupSocketHandlers = (io) => {
  // Store active users
  const activeUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user authentication
    socket.on('authenticate', (userId) => {
      activeUsers.set(socket.id, userId);
      socket.join(`user:${userId}`);
      console.log(`User ${userId} authenticated`);
    });

    // Handle joining chat rooms
    socket.on('join_room', (roomId) => {
      socket.join(`room:${roomId}`);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Handle leaving chat rooms
    socket.on('leave_room', (roomId) => {
      socket.leave(`room:${roomId}`);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    // Handle typing indicators
    socket.on('typing', ({ roomId, userId, isTyping }) => {
      if (!roomId || !userId) {
        console.warn('Invalid typing event data:', { roomId, userId, isTyping });
        return;
      }
      
      console.log(`User ${userId} ${isTyping ? 'started' : 'stopped'} typing in room ${roomId}`);
      
      // Broadcast to all users in the room except the sender
      socket.to(`room:${roomId}`).emit('user_typing', { 
        userId, 
        isTyping,
        roomId 
      });
    });

    // Handle read status
    socket.on('read_message', ({ roomId, messageIds, userId }) => {
      // Broadcast to all users in the room except the sender
      socket.to(`room:${roomId}`).emit('messages_read', { 
        messageIds, 
        userId, 
        readAt: new Date() 
      });
      console.log(`User ${userId} read messages in room ${roomId}:`, messageIds);
    });

    // Handle new message - ensure it updates the last message for all users
    socket.on('new_message', (message) => {
      console.log(`New message in room ${message.chatRoomId}`);
      
      // Broadcast the new message to all users in the room except the sender
      socket.to(`room:${message.chatRoomId}`).emit('new_message', message);
      
      // Also broadcast last_message_updated to all users in the room including the sender
      io.to(`room:${message.chatRoomId}`).emit('last_message_updated', {
        roomId: message.chatRoomId,
        message
      });
    });

    // Handle last message update
    socket.on('update_last_message', ({ roomId, message }) => {
      console.log('💬 Received update_last_message:', {
        roomId,
        message: message ? { 
          _id: message._id,
          content: message.content,
          senderId: message.senderId
        } : 'missing'
      });
      
      // Broadcast to ALL users in the room (including sender)
      io.to(`room:${roomId}`).emit('last_message_updated', {
        roomId,
        message
      });
      console.log(`📢 Broadcast last_message_updated for room ${roomId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const userId = activeUsers.get(socket.id);
      if (userId) {
        activeUsers.delete(socket.id);
        console.log(`User ${userId} disconnected`);
      }
      console.log('Client disconnected:', socket.id);
    });
  });
};

export { setupSocketHandlers }; 