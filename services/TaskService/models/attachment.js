import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
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

const Attachment = mongoose.model('Attachment', attachmentSchema);

export default Attachment;
