import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'review', 'completed'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'low',
    },
    project_id: {
      type: Number,
      required: true,
    },
    assignee_id: {
      type: String,
      default: null,
    },
    creator_id: {
      type: String,
      required: true,
    },
    due_date: {
      type: Date,
      default: null,
    },
    estimated_hours: {
      type: Number,
      default: null,
    },
    actual_hours: {
      type: Number,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attachments',
      }
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comments',
      }
    ],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Task = mongoose.model('Tasks', taskSchema);

export default Task;
