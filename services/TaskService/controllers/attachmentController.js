import Attachment from '../models/attachment.js';
import Task from '../models/task.js';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
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

      // Check if file is provided
      if (!req.file) {
        return ResponseHandler.error(res, 'No file uploaded', 400);
      }

      // Create FormData to send file to storage service
      const formData = new FormData();
      formData.append('file', fs.createReadStream(req.file.path));
      formData.append('task_id', value.task_id.toString());
      formData.append('entity_type', 'attachment');

      // Send file to storage service
      const storageResponse = await axios.post('http://localhost:3030/api/files', formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': req.headers.authorization // Forward the bearer token
        }
      });

      // Create attachment with file URL
      const attachmentData = {
        task_id: value.task_id,
        attachment_type: req.file.mimetype,
        attachment_url: storageResponse.data.url,
        status: value.status || 'active',
        original_filename: req.file.originalname,
        file_size: req.file.size
      };

      const attachment = await Attachment.create(attachmentData);

      // Remove temp file
      fs.unlinkSync(req.file.path);

      return ResponseHandler.success(res, 'Attachment created successfully', attachment, 201);
    } catch (error) {
      console.error('Error creating attachment:', error);

      // Clean up temp file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

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

      // If there's a new file, upload it
      if (req.file) {
        // Create FormData to send file to storage service
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));
        formData.append('task_id', attachment.task_id.toString());
        formData.append('entity_type', 'attachment');

        // Send file to storage service
        const storageResponse = await axios.post('http://localhost:3030/api/files', formData, {
          headers: {
            ...formData.getHeaders(),
            'Authorization': req.headers.authorization
          }
        });

        // Delete old file
        await axios.delete('http://localhost:3030/api/files/delete', {
          headers: {
            'Authorization': req.headers.authorization
          },
          data: {
            url: attachment.attachment_url
          }
        });

        // Update attachment data
        value.attachment_url = storageResponse.data.url;
        value.attachment_type = req.file.mimetype;
        value.original_filename = req.file.originalname;
        value.file_size = req.file.size;

        // Remove temp file
        fs.unlinkSync(req.file.path);
      }

      // Update attachment
      Object.assign(attachment, value);
      await attachment.save();

      return ResponseHandler.success(res, 'Attachment updated successfully', attachment);
    } catch (error) {
      console.error('Error updating attachment:', error);

      // Clean up temp file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

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

      // Delete file from storage service
      if (attachment.attachment_url) {
        await axios.delete('http://localhost:3030/api/files/delete', {
          headers: {
            'Authorization': req.headers.authorization
          },
          data: {
            url: attachment.attachment_url
          }
        });
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