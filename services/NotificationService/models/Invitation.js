import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  teamId: {
    type: Number,
    required: true,
  },
  teamName: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'accepted', 'declined']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

invitationSchema.index({ createdAt: -1 });

export default mongoose.model('Invitation', invitationSchema);