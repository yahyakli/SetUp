import Comment from '../models/comment.js';
import Task from '../models/task.js';
import { ResponseHandler } from '../utils/responseHandler.js';
import { createCommentSchema, updateCommentSchema } from '../utils/validationSchemas.js';

/**
 * Comment Controller containing CRUD operations
 */
export class CommentController {
  /**
   * Create a new comment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createComment(req, res) {
    try {
      // Validate request body
      const { error, value } = createCommentSchema.validate(req.body);
      if (error) {
        return ResponseHandler.error(res, 'Validation error', 400, error.details);
      }

      // Check if task exists
      const task = await Task.findById(value.task_id);
      if (!task) {
        return ResponseHandler.error(res, 'Task not found', 404);
      }

      // Create comment
      const comment = await Comment.create(value);

      return ResponseHandler.success(res, 'Comment created successfully', comment, 201);
    } catch (error) {
      console.error('Error creating comment:', error);
      return ResponseHandler.error(res, 'Failed to create comment', 500);
    }
  }

  /**
   * Get all comments for a task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getCommentsByTask(req, res) {
    try {
      const { taskId } = req.params;

      // Check if task exists
      const task = await Task.findById(taskId);
      if (!task) {
        return ResponseHandler.error(res, 'Task not found', 404);
      }

      const comments = await Comment.find({ task_id: taskId })
        .sort({ created_at: -1 });

      return ResponseHandler.success(res, 'Comments retrieved successfully', comments);
    } catch (error) {
      console.error('Error getting comments:', error);
      return ResponseHandler.error(res, 'Failed to retrieve comments', 500);
    }
  }

  /**
   * Get comment by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getCommentById(req, res) {
    try {
      const { id } = req.params;

      const comment = await Comment.findById(id);
      if (!comment) {
        return ResponseHandler.error(res, 'Comment not found', 404);
      }

      return ResponseHandler.success(res, 'Comment retrieved successfully', comment);
    } catch (error) {
      console.error('Error getting comment:', error);
      return ResponseHandler.error(res, 'Failed to retrieve comment', 500);
    }
  }

  /**
   * Update comment by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateComment(req, res) {
    try {
      const { id } = req.params;

      // Find comment
      const comment = await Comment.findById(id);
      if (!comment) {
        return ResponseHandler.error(res, 'Comment not found', 404);
      }

      // Check if user is the creator of the comment
      if (comment.creator_id.toString() !== req.user.id) {
        return ResponseHandler.error(res, 'Not authorized to update this comment', 403);
      }

      // Validate request body
      const { error, value } = updateCommentSchema.validate(req.body);
      if (error) {
        return ResponseHandler.error(res, 'Validation error', 400, error.details);
      }

      // Update comment
      Object.assign(comment, value);
      await comment.save();

      return ResponseHandler.success(res, 'Comment updated successfully', comment);
    } catch (error) {
      console.error('Error updating comment:', error);
      return ResponseHandler.error(res, 'Failed to update comment', 500);
    }
  }

  /**
   * Delete comment by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteComment(req, res) {
    try {
      const { id } = req.params;

      // Find comment
      const comment = await Comment.findById(id);
      if (!comment) {
        return ResponseHandler.error(res, 'Comment not found', 404);
      }

      // Check if user is the creator of the comment or has proper permissions
      if (comment.creator_id.toString() !== req.user.id && req.user.role !== 'admin') {
        return ResponseHandler.error(res, 'Not authorized to delete this comment', 403);
      }

      // Delete comment
      await comment.deleteOne();

      return ResponseHandler.success(res, 'Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      return ResponseHandler.error(res, 'Failed to delete comment', 500);
    }
  }

  /**
   * Get comments by project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getCommentsByProject(req, res) {
    try {
      const { projectId } = req.params;

      const comments = await Comment.find({ project_id: projectId })
        .sort({ created_at: -1 })
        .populate({
          path: 'task_id',
          select: 'id title'
        });

      return ResponseHandler.success(res, 'Project comments retrieved successfully', comments);
    } catch (error) {
      console.error('Error getting project comments:', error);
      return ResponseHandler.error(res, 'Failed to retrieve project comments', 500);
    }
  }
}