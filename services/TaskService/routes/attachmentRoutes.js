import express from 'express';
import { AttachmentController } from '../controllers/attachmentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import fileUpload from 'express-fileupload';
import path from 'path';

const router = express.Router();

// Configure file upload middleware
router.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  abortOnLimit: true,
  createParentPath: true
}));

// Serve static files from the uploads directory
router.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
router.post('/', authenticate, AttachmentController.createAttachment);
router.get('/task/:taskId', authenticate, AttachmentController.getAttachmentsByTask);
router.get('/:id', authenticate, AttachmentController.getAttachmentById);
router.put('/:id', authenticate, AttachmentController.updateAttachment);
router.delete('/:id', authenticate, AttachmentController.deleteAttachment);
router.patch('/:id/toggle-status', authenticate, AttachmentController.toggleAttachmentStatus);

export default router;