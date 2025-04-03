import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import chatRoomRoutes from './routes/chatRoomRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { corsConfig } from './config/index.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';

// Load environment variables
dotenv.config();

// Initialize express
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsConfig
});

// Setup __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(`MongoDB Connection Error: ${err.message}`));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsConfig));

// Log requests in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup socket.io
setupSocketHandlers(io);

// Make io accessible to route handlers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/chat-rooms', chatRoomRoutes);
app.use('/api/messages', messageRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});