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
      socket.to(`room:${roomId}`).emit('user_typing', { userId, isTyping });
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