import mongoose from 'mongoose';

const readBySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  readAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  chatRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  senderId: {
    type: String, // User ID from auth service
    required: true
  },
  content: {
    type: String,
    required: function() {
      return this.contentType === 'text';
    }
  },
  contentType: {
    type: String,
    enum: ['text', 'file'],
    required: true
  },
  readBy: [readBySchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for attachments - populate separately when needed
messageSchema.virtual('attachments', {
  ref: 'Attachment',
  localField: '_id',
  foreignField: 'messageId',
  justOne: false  // Set to false to get an array of attachments
});

// Indexes for faster queries
messageSchema.index({ chatRoomId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;