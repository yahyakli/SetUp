import express from 'express';
import { TaskController } from '../controllers/taskController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Task routes
router.post('/', TaskController.createTask);
router.get('/', TaskController.getAllTasks);
router.get('/stats', TaskController.getTaskStats);
router.get('/project/:projectId', TaskController.getTasksByProject);
router.get('/user/:userId', TaskController.getTasksByUser);
router.get('/:id', TaskController.getTaskById);
router.put('/:id', TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);
router.patch('/:id/status', TaskController.updateTaskStatus);
router.patch('/:id/assign', TaskController.assignTask);
router.delete('/user/:userId/team/:teamId', TaskController.removeUserTaskAssignments);

export default router;