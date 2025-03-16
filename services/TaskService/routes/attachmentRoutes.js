import express from 'express';
import multer from 'multer';
import path from 'path';
import { AttachmentController } from '../controllers/attachmentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  }
});

// Attachment routes
router.post('/', authenticate, upload.single('file'), AttachmentController.createAttachment);
router.get('/task/:taskId', authenticate, AttachmentController.getAttachmentsByTask);
router.get('/:id', authenticate, AttachmentController.getAttachmentById);
router.put('/:id', authenticate, upload.single('file'), AttachmentController.updateAttachment);
router.delete('/:id', authenticate, AttachmentController.deleteAttachment);
router.patch('/:id/toggle-status', authenticate, AttachmentController.toggleAttachmentStatus);

export default router;