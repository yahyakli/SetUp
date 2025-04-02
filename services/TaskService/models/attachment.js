import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Tasks',
    },
    attachment_type: {
      type: String,
      required: true
    },
    attachment_url: {
      type: String,
      required: true
    },
    original_filename: {
      type: String,
      required: true
    },
    file_size: {
      type: Number,
      required: true
    },
    uploaded_by: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Attachment = mongoose.model('Attachments', attachmentSchema);

export default Attachment;
