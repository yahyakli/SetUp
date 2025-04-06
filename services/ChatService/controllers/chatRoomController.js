import asyncHandler from 'express-async-handler';
import ChatRoom from '../models/chatRoom.js';
import { validateChatRoom } from '../utils/validation.js';

// @desc    Create a new chat room
// @route   POST /api/chat-rooms
// @access  Private
const createChatRoom = asyncHandler(async (req, res) => {
  // Validate request body
  const { error } = validateChatRoom(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  // Ensure the creator is included in participants
  if (!req.body.participants.includes(req.body.user_id)) {
    req.body.participants.push(req.body.user_id);
  }

  // Create chat room
  const chatRoom = await ChatRoom.create(req.body);

  // Emit socket event for new chat room
  chatRoom.participants.forEach(participantId => {
    req.io.to(`user:${participantId}`).emit('new_chat_room', chatRoom);
  });

  res.status(201).json(chatRoom);
});

// @desc    Get all chat rooms for the current user
// @route   GET /api/chat-rooms
// @access  Private
const getChatRooms = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const chatRooms = await ChatRoom.find({
    participants: userId
  }).sort({ updatedAt: -1 });

  res.json(chatRooms);
});

// @desc    Get chat room by ID
// @route   GET /api/chat-rooms/:id
// @access  Private
const getChatRoomById = asyncHandler(async (req, res) => {
  const chatRoom = await ChatRoom.findOne({
    _id: req.params.id,
    participants: req.body.user_id
  });

  if (!chatRoom) {
    res.status(404);
    throw new Error('Chat room not found or you are not a participant');
  }

  res.json(chatRoom);
});

// @desc    Update chat room
// @route   PUT /api/chat-rooms/:id
// @access  Private
const updateChatRoom = asyncHandler(async (req, res) => {
  const chatRoom = await ChatRoom.findById(req.params.id);

  if (!chatRoom) {
    res.status(404);
    throw new Error('Chat room not found');
  }

  // Validate request body
  const { error } = validateChatRoom(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  // Ensure the current user remains a participant
  if (!req.body.participants.includes(req.body.user_id)) {
    req.body.participants.push(req.body.user_id);
  }

  // Update chat room
  const updatedChatRoom = await ChatRoom.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  // Emit socket event for updated chat room
  updatedChatRoom.participants.forEach(participantId => {
    req.io.to(`user:${participantId}`).emit('update_chat_room', updatedChatRoom);
  });

  // Notify removed participants
  const removedParticipants = chatRoom.participants.filter(
    participant => !updatedChatRoom.participants.includes(participant)
  );

  removedParticipants.forEach(participantId => {
    req.io.to(`user:${participantId}`).emit('removed_from_chat_room', {
      chatRoomId: updatedChatRoom._id,
      name: updatedChatRoom.name
    });
  });

  res.json(updatedChatRoom);
});

// @desc    Add participant to chat room
// @route   POST /api/chat-rooms/:id/participants
// @access  Private
const addParticipant = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error('User ID is required');
  }

  const chatRoom = await ChatRoom.findById(req.params.id);

  if (!chatRoom) {
    res.status(404);
    throw new Error('Chat room not found');
  }

  // Check if user is already a participant
  if (chatRoom.participants.includes(userId)) {
    res.status(400);
    throw new Error('User is already a participant');
  }

  // Add participant
  chatRoom.participants.push(userId);
  await chatRoom.save();

  // Emit socket event for the new participant
  req.io.to(`user:${userId}`).emit('added_to_chat_room', chatRoom);

  // Notify existing participants
  chatRoom.participants.forEach(participantId => {
    if (participantId !== userId) {
      req.io.to(`user:${participantId}`).emit('participant_added', {
        chatRoomId: chatRoom._id,
        userId: userId
      });
    }
  });

  res.json(chatRoom);
});

// @desc    Remove participant from chat room
// @route   DELETE /api/chat-rooms/:id/participants/:userId
// @access  Private
const removeParticipant = asyncHandler(async (req, res) => {
  const chatRoom = await ChatRoom.findById(req.params.id);

  if (!chatRoom) {
    res.status(404);
    throw new Error('Chat room not found');
  }

  // Check if user is a participant
  if (!chatRoom.participants.includes(req.params.userId)) {
    res.status(400);
    throw new Error('User is not a participant');
  }

  // Store the user ID being removed
  const removedUserId = req.params.userId;

  // Remove participant
  chatRoom.participants = chatRoom.participants.filter(
    participant => participant !== removedUserId
  );

  await chatRoom.save();

  // Emit socket event for the removed participant
  req.io.to(`user:${removedUserId}`).emit('removed_from_chat_room', {
    chatRoomId: chatRoom._id,
    name: chatRoom.name
  });

  // Notify remaining participants
  chatRoom.participants.forEach(participantId => {
    req.io.to(`user:${participantId}`).emit('participant_removed', {
      chatRoomId: chatRoom._id,
      userId: removedUserId
    });
  });

  res.json(chatRoom);
});

// @desc    Delete chat room
// @route   DELETE /api/chat-rooms/:id
// @access  Private
const deleteChatRoom = asyncHandler(async (req, res) => {
  const chatRoom = await ChatRoom.findById(req.params.id);

  if (!chatRoom) {
    res.status(404);
    throw new Error('Chat room not found');
  }

  // Store participants before deletion
  const participants = [...chatRoom.participants];

  await chatRoom.deleteOne();

  // Emit socket event to all participants
  participants.forEach(participantId => {
    req.io.to(`user:${participantId}`).emit('chat_room_deleted', {
      chatRoomId: chatRoom._id,
      name: chatRoom.name
    });
  });

  res.json({ message: 'Chat room removed' });
});

export {
  createChatRoom,
  getChatRooms,
  getChatRoomById,
  updateChatRoom,
  addParticipant,
  removeParticipant,
  deleteChatRoom
};