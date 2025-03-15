import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Task',
    },
    project_id: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    creator_id: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
