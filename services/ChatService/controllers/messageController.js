import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Message from '../models/message.js';
import ChatRoom from '../models/chatRoom.js';
import Attachment from '../models/attachment.js';
import { validateMessage, validateMessageQuery } from '../utils/validation.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Create a new message
// @route   POST /api/messages
// @access  Private
const createMessage = asyncHandler(async (req, res) => {
  // Validate request body
  const { error } = validateMessage(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  // Check if chat room exists and user is participant
  const chatRoom = await ChatRoom.findOne({
    _id: req.body.chatRoomId,
    participants: req.body.user_id
  });

  if (!chatRoom) {
    res.status(404);
    throw new Error('Chat room not found or you are not a participant');
  }

  // Create message
  const message = await Message.create({
    chatRoomId: req.body.chatRoomId,
    senderId: req.body.user_id,
    content: req.body.content,
    contentType: req.body.contentType,
    readBy: [{ userId: req.body.user_id, readAt: new Date() }]
  });

  // Handle attachment if present
  if (req.file) {
    // Create attachment
    const attachment = await Attachment.create({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      size: req.file.size,
      messageId: message._id,
      uploadedBy: req.body.user_id
    });
    
    // If attachment was successfully created, update message type
    if (attachment) {
      message.contentType = 'file';
      await message.save();
    }
  }

  // Update chat room's updatedAt
  chatRoom.updatedAt = new Date();
  await chatRoom.save();

  // Populate attachments before sending response
  const populatedMessage = await Message.findById(message._id).populate('attachments');

  // Instead of emitting new_message directly, use the socket event that will handle both
  // new_message and last_message_updated
  req.io.to(`room:${req.body.chatRoomId}`).emit('new_message', populatedMessage);
  
  // Explicitly emit last_message_updated to ensure all clients update their chat room list
  req.io.to(`room:${req.body.chatRoomId}`).emit('last_message_updated', {
    roomId: req.body.chatRoomId,
    message: populatedMessage
  });

  res.status(201).json(populatedMessage);
});

// @desc    Get messages by chat room ID
// @route   GET /api/messages/chat-room/:chatRoomId
// @access  Private
const getMessagesByChatRoom = asyncHandler(async (req, res) => {
  const chatRoom = await ChatRoom.findOne({
    _id: req.params.chatRoomId,
    participants: req.params.userId
  });

  if (!chatRoom) {
    res.status(404);
    throw new Error('Chat room not found or you are not a participant');
  }

  // Validate query parameters
  const { error, value } = validateMessageQuery(req.query);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  const { limit, page, before, after } = value;
  const skip = (page - 1) * limit;

  // Build query
  let query = { chatRoomId: req.params.chatRoomId };

  if (before) {
    query.createdAt = { ...query.createdAt, $lt: new Date(before) };
  }

  if (after) {
    query.createdAt = { ...query.createdAt, $gt: new Date(after) };
  }

  // Get messages
  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('attachments');

  // Mark messages as read
  const messageIds = messages.map(message => message._id);

  if (messageIds.length > 0) {
    await Message.updateMany(
      {
        _id: { $in: messageIds },
        'readBy.userId': { $ne: req.params.userId }
      },
      {
        $push: { readBy: { userId: req.params.userId, readAt: new Date() } }
      }
    );
  }

  // Get total count for pagination
  const total = await Message.countDocuments(query);

  res.json({
    messages,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Upload attachment
// @route   POST /api/messages/:messageId/attachments
// @access  Private
const uploadAttachment = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const message = await Message.findById(req.params.messageId);

  if (!message) {
    // Delete uploaded file if message doesn't exist
    fs.unlinkSync(req.file.path);
    res.status(404);
    throw new Error('Message not found');
  }

  // Check if user is the sender of the message
  if (message.senderId !== req.body.user_id) {
    // Delete uploaded file if user is not sender
    fs.unlinkSync(req.file.path);
    res.status(403);
    throw new Error('Not authorized, only message sender can attach files');
  }

  // Update message type if it's the first attachment
  if (message.contentType !== 'file') {
    message.contentType = 'file';
    await message.save();
  }

  // Create attachment
  const attachment = await Attachment.create({
    originalName: req.file.originalname,
    fileName: req.file.filename,
    path: `/uploads/${req.file.filename}`,
    mimeType: req.file.mimetype,
    size: req.file.size,
    messageId: message._id,
    uploadedBy: req.body.user_id
  });

  res.status(201).json(attachment);
});

// @desc    Get message attachments
// @route   GET /api/messages/:messageId/attachments
// @access  Private
const getAttachments = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  // Check if chat room exists and user is participant
  const chatRoom = await ChatRoom.findOne({
    _id: message.chatRoomId,
    participants: req.body.user_id
  });

  if (!chatRoom) {
    res.status(403);
    throw new Error('Not authorized to access this message');
  }

  const attachments = await Attachment.find({ messageId: message._id });

  res.json(attachments);
});

// @desc    Delete attachment
// @route   DELETE /api/messages/attachments/:attachmentId
// @access  Private
const deleteAttachment = asyncHandler(async (req, res) => {
  const attachment = await Attachment.findById(req.params.attachmentId);

  if (!attachment) {
    res.status(404);
    throw new Error('Attachment not found');
  }

  // Get message
  const message = await Message.findById(attachment.messageId);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  // Check if user is the sender of the message
  if (message.senderId !== req.body.user_id) {
    res.status(403);
    throw new Error('Not authorized, only message sender can delete attachments');
  }

  // Delete file from filesystem
  const filePath = path.join(__dirname, '..', attachment.path);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }

  // Delete attachment from database
  await attachment.deleteOne();

  // Check if message has other attachments
  const remainingAttachments = await Attachment.countDocuments({ messageId: message._id });

  // If no attachments left and message is file type, update to text type
  if (remainingAttachments === 0 && message.contentType === 'file') {
    message.contentType = 'text';
    message.content = 'Attachment deleted';
    await message.save();
  }

  res.json({ message: 'Attachment removed' });
});

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:userId
// @access  Private
const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { messageIds, chatRoomId } = req.body;
  const userId = req.params.userId;

  if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
    res.status(400);
    throw new Error('No message IDs provided');
  }

  // Validate message IDs
  if (!messageIds.every(id => mongoose.Types.ObjectId.isValid(id))) {
    res.status(400);
    throw new Error('Invalid message ID format');
  }

  // Mark messages as read
  await Message.updateMany(
    {
      _id: { $in: messageIds },
      'readBy.userId': { $ne: userId }
    },
    {
      $push: { readBy: { userId: userId, readAt: new Date() } }
    }
  );

  // Emit socket event for messages read
  if (chatRoomId) {
    req.io.to(`room:${chatRoomId}`).emit('messages_read', {
      messageIds,
      userId: userId,
      readAt: new Date()
    });
  }

  res.json({ message: 'Messages marked as read' });
});

// @desc    Get paginated messages for a chat room
// @route   GET /api/messages/paginated/:chatRoomId
// @access  Private
const getPaginatedMessages = asyncHandler(async (req, res) => {
  // Check if chat room exists and user is participant
  const chatRoom = await ChatRoom.findOne({
    _id: req.params.chatRoomId,
    participants: req.params.userId
  });

  if (!chatRoom) {
    res.status(404);
    throw new Error('Chat room not found or you are not a participant');
  }

  // Get pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Get messages
  const messages = await Message.find({ chatRoomId: req.params.chatRoomId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('attachments');
  
  // Get total count for pagination
  const total = await Message.countDocuments({ chatRoomId: req.params.chatRoomId });

  res.json({
    messages,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  });
});

// @desc    Get more messages based on last message ID
// @route   GET /api/messages/more/:chatRoomId/:lastMessageId
// @access  Private
const getMoreMessages = asyncHandler(async (req, res) => {
  // Check if chat room exists and user is participant
  const chatRoom = await ChatRoom.findOne({
    _id: req.params.chatRoomId,
    participants: req.params.userId
  });

  if (!chatRoom) {
    res.status(404);
    throw new Error('Chat room not found or you are not a participant');
  }

  const { lastMessageId } = req.params;
  const limit = parseInt(req.query.limit) || 20;

  // Validate lastMessageId
  if (!mongoose.Types.ObjectId.isValid(lastMessageId)) {
    res.status(400);
    throw new Error('Invalid message ID format');
  }

  // Get the last message to determine its timestamp
  const lastMessage = await Message.findById(lastMessageId);
  if (!lastMessage) {
    res.status(404);
    throw new Error('Last message not found');
  }

  // Get older messages
  const messages = await Message.find({
    chatRoomId: req.params.chatRoomId,
    createdAt: { $lt: lastMessage.createdAt }
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('attachments');

  // Check if there are more messages
  const hasMore = messages.length === limit;

  res.json({
    messages,
    hasMore
  });
});

export {
  createMessage,
  getMessagesByChatRoom,
  uploadAttachment,
  getAttachments,
  deleteAttachment,
  markMessagesAsRead,
  getPaginatedMessages,
  getMoreMessages
};