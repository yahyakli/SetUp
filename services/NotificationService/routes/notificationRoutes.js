import express from 'express'; 
const router = express.Router();
import notificationController from '../controllers/notificationController.js';
import authMiddleware from '../middleware/auth.js';

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create notification
router.post('/', notificationController.createNotification);

// Get user notifications
router.get('/user/:userId', notificationController.getUserNotifications);

// Get unread count
router.get('/user/:userId/unread', notificationController.getUnreadCount);

// Mark notifications as read
router.post('/read/:userId', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/user/:userId/read-all', notificationController.markAllAsRead);

// Update notification
router.patch('/:id', notificationController.updateNotification);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

export default router;  