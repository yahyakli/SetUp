import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import notificationRoutes from './routes/notificationRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import jwt from 'jsonwebtoken';

dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Handle joining notification room
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined their notification room`);
      
      // Send confirmation
      socket.emit('joined', { status: 'success', room: userId });
    }
  });
  
  // Handle explicit authentication if needed
  socket.on('authenticate', (token) => {
    if (token) {
      try {
        const decoded = jwt.verify(token, Buffer.from(process.env.JWT_SECRET, 'base64'));
        socket.user = decoded;
        socket.join(decoded.id);
        console.log('User authenticated:', decoded.id);
        socket.emit('authenticated', { status: 'success', userId: decoded.id });
      } catch (error) {
        console.log('Authentication failed:', error.message);
        socket.emit('authenticated', { status: 'error', message: 'Invalid token' });
      }
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// Make io accessible to the routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/invitations', invitationRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});