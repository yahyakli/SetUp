import mongoose from 'mongoose';
import Task from '../models/task.js';
import Comment from '../models/comment.js';
import Attachment from '../models/attachment.js';
import { ResponseHandler } from '../utils/responseHandler.js';
import { createTaskSchema, updateTaskSchema } from '../utils/validationSchemas.js';

/**
 * Task Controller containing CRUD operations and additional utility functions
 */
export class TaskController {
  /**
   * Create a new task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createTask(req, res) {
    try {
      // Validate request body
      const { error, value } = createTaskSchema.validate(req.body);
      if (error) {
        return ResponseHandler.error(res, 'Validation error', 400, error.details);
      }

      // Create task
      const task = await Task.create(value);

      return ResponseHandler.success(res, 'Task created successfully', task, 201);
    } catch (error) {
      console.error('Error creating task:', error);
      return ResponseHandler.error(res, 'Failed to create task', 500);
    }
  }

  /**
   * Get all tasks with filtering options
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAllTasks(req, res) {
    try {
      const tasks = await Task.find({});

      return ResponseHandler.success(res, 'Tasks retrieved successfully', tasks);
    } catch (error) {
      console.error('Error getting tasks:', error);
      return ResponseHandler.error(res, 'Failed to retrieve tasks', 500);
    }
  }

  /**
   * Get task by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getTaskById(req, res) {
    try {
      const { id } = req.params;

      const task = await Task.findById(id)
        .populate('attachments')
        .populate('comments');

      if (!task) {
        return ResponseHandler.error(res, 'Task not found', 404);
      }

      return ResponseHandler.success(res, 'Task retrieved successfully', task);
    } catch (error) {
      console.error('Error getting task:', error);
      return ResponseHandler.error(res, 'Failed to retrieve task', 500);
    }
  }

  /**
   * Update task by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateTask(req, res) {
    try {
      const { id } = req.params;

      // Find task
      const task = await Task.findById(id);
      if (!task) {
        return ResponseHandler.error(res, 'Task not found', 404);
      }

      // Validate request body
      const { error, value } = updateTaskSchema.validate(req.body);
      if (error) {
        return ResponseHandler.error(res, 'Validation error', 400, error.details);
      }

      // Update task
      Object.assign(task, value);
      await task.save();

      return ResponseHandler.success(res, 'Task updated successfully', task);
    } catch (error) {
      console.error('Error updating task:', error);
      return ResponseHandler.error(res, 'Failed to update task', 500);
    }
  }

  /**
   * Delete task by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteTask(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { id } = req.params;

      // Find task
      const task = await Task.findById(id).session(session);
      if (!task) {
        await session.abortTransaction();
        session.endSession();
        return ResponseHandler.error(res, 'Task not found', 404);
      }

      // Delete related comments and attachments
      await Comment.deleteMany({ task_id: id }).session(session);
      await Attachment.deleteMany({ task_id: id }).session(session);

      // Delete task
      await task.deleteOne({ session });

      await session.commitTransaction();
      session.endSession();

      return ResponseHandler.success(res, 'Task deleted successfully');
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error deleting task:', error);
      return ResponseHandler.error(res, 'Failed to delete task', 500);
    }
  }

  /**
   * Update task status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateTaskStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['todo', 'in_proggress', 'review', 'completed'].includes(status)) {
        return ResponseHandler.error(res, 'Invalid status value', 400);
      }

      const task = await Task.findById(id);
      if (!task) {
        return ResponseHandler.error(res, 'Task not found', 404);
      }

      task.status = status;
      await task.save();

      return ResponseHandler.success(res, 'Task status updated successfully', task);
    } catch (error) {
      console.error('Error updating task status:', error);
      return ResponseHandler.error(res, 'Failed to update task status', 500);
    }
  }

  /**
   * Assign task to user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async assignTask(req, res) {
    try {
      const { id } = req.params;
      const { assignee_id } = req.body;

      const task = await Task.findById(id);
      if (!task) {
        return ResponseHandler.error(res, 'Task not found', 404);
      }

      task.assignee_id = assignee_id;
      await task.save();

      return ResponseHandler.success(res, 'Task assigned successfully', task);
    } catch (error) {
      console.error('Error assigning task:', error);
      return ResponseHandler.error(res, 'Failed to assign task', 500);
    }
  }

  /**
   * Get tasks by project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getTasksByProject(req, res) {
    try {
      const { projectId } = req.params;
      const { status, priority } = req.query;

      const filter = { project_id: projectId };

      if (status) filter.status = status;
      if (priority) filter.priority = priority;

      const tasks = await Task.find(filter)
        .populate('attachments', 'task_id')
        .populate('comments', 'task_id');

      return ResponseHandler.success(res, 'Project tasks retrieved successfully', tasks);
    } catch (error) {
      console.error('Error getting project tasks:', error);
      return ResponseHandler.error(res, 'Failed to retrieve project tasks', 500);
    }
  }

  /**
   * Get tasks by user (assignee)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getTasksByUser(req, res) {
    try {
      const { userId } = req.params;
      const { status, priority } = req.query;

      const filter = { assignee_id: userId };

      if (status) filter.status = status;
      if (priority) filter.priority = priority;

      const tasks = await Task.find(filter);

      return ResponseHandler.success(res, 'User tasks retrieved successfully', tasks);
    } catch (error) {
      console.error('Error getting user tasks:', error);
      return ResponseHandler.error(res, 'Failed to retrieve user tasks', 500);
    }
  }

  /**
   * Get task statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getTaskStats(req, res) {
    try {
      const { project_id } = req.query;
      const filter = {};

      if (project_id) filter.project_id = project_id;

      // Get task counts by status
      const statusCounts = await Task.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      // Get task counts by priority
      const priorityCounts = await Task.aggregate([
        { $match: filter },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]);

      // Get total tasks
      const totalTasks = await Task.countDocuments(filter);

      // Get overdue tasks
      const overdueTasks = await Task.countDocuments({
        ...filter,
        due_date: { $lt: new Date() },
        status: { $ne: 'completed' }
      });

      // Format statistics
      const stats = {
        total: totalTasks,
        overdue: overdueTasks,
        byStatus: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPriority: priorityCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      };

      return ResponseHandler.success(res, 'Task statistics retrieved successfully', stats);
    } catch (error) {
      console.error('Error getting task statistics:', error);
      return ResponseHandler.error(res, 'Failed to retrieve task statistics', 500);
    }
  }
}