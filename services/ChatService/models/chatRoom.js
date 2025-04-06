import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['project', 'direct'],
    required: true
  },
  projectId: {
    type: Number,
    required: function() {
      return this.type === 'project';
    }
  },
  participants: {
    type: [String],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ projectId: 1 }, { sparse: true });

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

export default ChatRoom;