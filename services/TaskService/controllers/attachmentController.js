import Attachment from '../models/attachment.js';
import Task from '../models/task.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ResponseHandler } from '../utils/responseHandler.js';
import { createAttachmentSchema, updateAttachmentSchema } from '../utils/validationSchemas.js';

/**
 * Attachment Controller containing CRUD operations with local file storage
 */
export class AttachmentController {
  /**
   * Save file to local storage
   * @param {Object} file - File object from express-fileupload
   * @param {String} taskId - ID of the task
   * @returns {Object} - Object containing file path and other details
   */
  static async saveFileLocally(file, taskId) {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create task directory if it doesn't exist
    const taskDir = path.join(uploadsDir, taskId);
    if (!fs.existsSync(taskDir)) {
      fs.mkdirSync(taskDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(taskDir, fileName);
    const relativePath = path.join('uploads', taskId, fileName);

    // Save file
    await file.mv(filePath);

    return {
      filePath,
      relativePath: relativePath.replace(/\\/g, '/'), // Ensure forward slashes for URLs
      fileName
    };
  }

  /**
   * Delete file from local storage
   * @param {String} filePath - Path to the file
   */
  static async deleteFileLocally(filePath) {
    const absolutePath = path.join(process.cwd(), filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

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

      // Check if file is provided in the form data
      if (!req.files || !req.files.file) {
        return ResponseHandler.error(res, 'No file uploaded', 400);
      }

      // Save file locally
      const fileInfo = await AttachmentController.saveFileLocally(req.files.file, value.task_id);

      // Create attachment record
      const attachmentData = {
        task_id: value.task_id,
        attachment_type: req.files.file.mimetype,
        attachment_url: fileInfo.relativePath,
        status: value.status || 'active',
        original_filename: req.files.file.name,
        file_size: req.files.file.size
      };

      const attachment = await Attachment.create(attachmentData);

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

      // If there's a new file, save it
      if (req.files && req.files.file) {
        // Save new file
        const fileInfo = await AttachmentController.saveFileLocally(req.files.file, attachment.task_id);

        // Delete old file
        await AttachmentController.deleteFileLocally(attachment.attachment_url);

        // Update attachment data with new file info
        value.attachment_url = fileInfo.relativePath;
        value.attachment_type = req.files.file.mimetype;
        value.original_filename = req.files.file.name;
        value.file_size = req.files.file.size;
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

      // Delete file from local storage
      if (attachment.attachment_url) {
        await AttachmentController.deleteFileLocally(attachment.attachment_url);
      }

      // Delete attachment record
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