import Attachment from '../models/attachment.js';
import Task from '../models/task.js';
import { ResponseHandler } from '../utils/responseHandler.js';
import { createAttachmentSchema, updateAttachmentSchema } from '../utils/validationSchemas.js';

/**
 * Attachment Controller containing CRUD operations
 */
export class AttachmentController {
  /**
   * Create a new attachment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createAttachment(req, res) {
    try {
      // Validate request body
      const { error, value } = createAttachmentSchema.validate(req.body);
      if (error) {
        return ResponseHandler.error(res, 'Validation error', 400, error.details);
      }

      // Check if task exists
      const task = await Task.findById(value.task_id);
      if (!task) {
        return ResponseHandler.error(res, 'Task not found', 404);
      }

      // Create attachment
      const attachment = await Attachment.create(value);

      return ResponseHandler.success(res, 'Attachment created successfully', attachment, 201);
    } catch (error) {
      console.error('Error creating attachment:', error);
      return ResponseHandler.error(res, 'Failed to create attachment', 500);
    }
  }

  /**
   * Get all attachments for a task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAttachmentsByTask(req, res) {
    try {
      const { taskId } = req.params;
      const { status = 'active' } = req.query;

      // Check if task exists
      const task = await Task.findById(taskId);
      if (!task) {
        return ResponseHandler.error(res, 'Task not found', 404);
      }

      const filter = { task_id: taskId };
      if (status !== 'all') {
        filter.status = status;
      }

      const attachments = await Attachment.find(filter)
        .sort({ created_at: -1 });

      return ResponseHandler.success(res, 'Attachments retrieved successfully', attachments);
    } catch (error) {
      console.error('Error getting attachments:', error);
      return ResponseHandler.error(res, 'Failed to retrieve attachments', 500);
    }
  }

  /**
   * Get attachment by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAttachmentById(req, res) {
    try {
      const { id } = req.params;

      const attachment = await Attachment.findById(id);
      if (!attachment) {
        return ResponseHandler.error(res, 'Attachment not found', 404);
      }

      return ResponseHandler.success(res, 'Attachment retrieved successfully', attachment);
    } catch (error) {
      console.error('Error getting attachment:', error);
      return ResponseHandler.error(res, 'Failed to retrieve attachment', 500);
    }
  }

  /**
   * Update attachment by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateAttachment(req, res) {
    try {
      const { id } = req.params;

      // Find attachment
      const attachment = await Attachment.findById(id);
      if (!attachment) {
        return ResponseHandler.error(res, 'Attachment not found', 404);
      }

      // Validate request body
      const { error, value } = updateAttachmentSchema.validate(req.body);
      if (error) {
        return ResponseHandler.error(res, 'Validation error', 400, error.details);
      }

      // Update attachment
      Object.assign(attachment, value);
      await attachment.save();

      return ResponseHandler.success(res, 'Attachment updated successfully', attachment);
    } catch (error) {
      console.error('Error updating attachment:', error);
      return ResponseHandler.error(res, 'Failed to update attachment', 500);
    }
  }

  /**
   * Delete attachment by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteAttachment(req, res) {
    try {
      const { id } = req.params;

      // Find attachment
      const attachment = await Attachment.findById(id);
      if (!attachment) {
        return ResponseHandler.error(res, 'Attachment not found', 404);
      }

      // Delete attachment (or set status to inactive)
      await attachment.deleteOne();

      return ResponseHandler.success(res, 'Attachment deleted successfully');
    } catch (error) {
      console.error('Error deleting attachment:', error);
      return ResponseHandler.error(res, 'Failed to delete attachment', 500);
    }
  }

  /**
   * Toggle attachment status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async toggleAttachmentStatus(req, res) {
    try {
      const { id } = req.params;

      // Find attachment
      const attachment = await Attachment.findById(id);
      if (!attachment) {
        return ResponseHandler.error(res, 'Attachment not found', 404);
      }

      // Toggle status
      const newStatus = attachment.status === 'active' ? 'inactive' : 'active';
      attachment.status = newStatus;
      await attachment.save();

      return ResponseHandler.success(res, `Attachment ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, attachment);
    } catch (error) {
      console.error('Error toggling attachment status:', error);
      return ResponseHandler.error(res, 'Failed to toggle attachment status', 500);
    }
  }
}