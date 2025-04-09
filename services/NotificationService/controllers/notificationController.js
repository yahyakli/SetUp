import Notification from '../models/Notification.js';
import { createNotificationSchema, updateNotificationSchema } from '../validation/notificationValidation.js';

class NotificationController {

  // Create a new notification
  async createNotification(req, res) {
    try {
      // Validate request body
      const { error, value } = createNotificationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const notification = new Notification(value);
      await notification.save();

      // Emit socket event to the user
      req.io.to(value.userId).emit('new_notification', notification);

      return res.status(201).json(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get all notifications for a user
  async getUserNotifications(req, res) {
    try {
      const userId = req.params.userId;

      // Check if the requesting user matches the userId or has admin privileges
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Cannot access other users\' notifications' });
      }

      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(parseInt(req.query.limit) || 50);

      return res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get unread notifications count
  async getUnreadCount(req, res) {
    try {
      const userId = req.params.userId;

      // Check permissions
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Cannot access other users\' notifications' });
      }

      const count = await Notification.countDocuments({
        userId,
        read: false
      });

      return res.status(200).json({ unreadCount: count });
    } catch (error) {
      console.error('Error counting unread notifications:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const notificationId = req.params.id;

      const notification = await Notification.findById(notificationId);

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      // Check permissions
      if (req.user.id !== notification.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Cannot modify other users\' notifications' });
      }

      notification.read = true;
      await notification.save();

      return res.status(200).json(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const userId = req.params.userId;

      // Check permissions
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Cannot modify other users\' notifications' });
      }

      await Notification.updateMany(
        { userId, read: false },
        { $set: { read: true } }
      );

      return res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Update a notification
  async updateNotification(req, res) {
    try {
      const notificationId = req.params.id;

      // Validate request body
      const { error, value } = updateNotificationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const notification = await Notification.findById(notificationId);

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      // Check permissions
      if (req.user.id !== notification.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Cannot modify other users\' notifications' });
      }

      // Update fields
      Object.keys(value).forEach(key => {
        if (value[key] !== undefined) {
          notification[key] = value[key];
        }
      });

      await notification.save();

      return res.status(200).json(notification);
    } catch (error) {
      console.error('Error updating notification:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Delete a notification
  async deleteNotification(req, res) {
    try {
      const notificationId = req.params.id;

      const notification = await Notification.findById(notificationId);

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      // Check permissions
      if (req.user.id !== notification.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Cannot delete other users\' notifications' });
      }

      await notification.remove();

      return res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
}

export default new NotificationController();