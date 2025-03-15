import express from 'express';
import { CommentController } from '../controllers/commentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Comment routes
router.post('/', CommentController.createComment);
router.get('/task/:taskId', CommentController.getCommentsByTask);
router.get('/project/:projectId', CommentController.getCommentsByProject);
router.get('/:id', CommentController.getCommentById);
router.put('/:id', CommentController.updateComment);
router.delete('/:id', CommentController.deleteComment);

export default router;