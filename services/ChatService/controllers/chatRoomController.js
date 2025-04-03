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
  if (!req.body.participants.includes(req.user.id)) {
    req.body.participants.push(req.user.id);
  }

  // Create chat room
  const chatRoom = await ChatRoom.create(req.body);

  res.status(201).json(chatRoom);
});

// @desc    Get all chat rooms for the current user
// @route   GET /api/chat-rooms
// @access  Private
const getChatRooms = asyncHandler(async (req, res) => {
  const chatRooms = await ChatRoom.find({
    participants: req.user.id
  }).sort({ updatedAt: -1 });

  res.json(chatRooms);
});

// @desc    Get chat room by ID
// @route   GET /api/chat-rooms/:id
// @access  Private
const getChatRoomById = asyncHandler(async (req, res) => {
  const chatRoom = await ChatRoom.findOne({
    _id: req.params.id,
    participants: req.user.id
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
  if (!req.body.participants.includes(req.user.id)) {
    req.body.participants.push(req.user.id);
  }

  // Update chat room
  const updatedChatRoom = await ChatRoom.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

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

  // Remove participant
  chatRoom.participants = chatRoom.participants.filter(
    participant => participant !== req.params.userId
  );

  await chatRoom.save();

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

  await chatRoom.deleteOne();

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