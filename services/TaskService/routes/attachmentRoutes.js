import express from 'express';
import { AttachmentController } from '../controllers/attachmentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Attachment routes
router.post('/', AttachmentController.createAttachment);
router.get('/task/:taskId', AttachmentController.getAttachmentsByTask);
router.get('/:id', AttachmentController.getAttachmentById);
router.put('/:id', AttachmentController.updateAttachment);
router.delete('/:id', AttachmentController.deleteAttachment);
router.patch('/:id/toggle-status', AttachmentController.toggleAttachmentStatus);

export default router;