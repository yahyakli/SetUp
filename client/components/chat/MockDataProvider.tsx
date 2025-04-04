"use client";

import React from 'react';
import { ChatRoom, Message, User } from '@/types';

// Mock data for demonstration
export const mockUsers: Record<string, User> = {
  'user1': {
    id: 'user1',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  'user2': {
    id: 'user2',
    firstName: 'Jane',
    lastName: 'Smith',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  'user3': {
    id: 'user3',
    firstName: 'Team',
    lastName: 'Alpha',
    avatar: 'https://ui-avatars.com/api/?name=Team+Alpha',
    email: 'team@example.com',
    role: 'user',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

export const mockChatRooms: ChatRoom[] = [
  {
    _id: 'room1',
    name: 'Project Falcon',
    type: 'project',
    projectId: 1,
    participants: ['user1', 'user2', 'user3'],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastMessage: {
      _id: 'msg1',
      chatRoomId: 'room1',
      senderId: 'user2',
      content: 'When is the next meeting?',
      contentType: 'text',
      readBy: [{ userId: 'user2', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 30)
    }
  },
  {
    _id: 'room2',
    name: 'Jane Smith',
    type: 'direct',
    participants: ['user1', 'user2'],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastMessage: {
      _id: 'msg2',
      chatRoomId: 'room2',
      senderId: 'user1',
      content: 'Thanks for your help!',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 5)
    }
  },
  {
    _id: 'room3',
    name: 'Project Phoenix',
    type: 'project',
    projectId: 2,
    participants: ['user1', 'user3'],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastMessage: {
      _id: 'msg3',
      chatRoomId: 'room3',
      senderId: 'user3',
      content: 'I&#39;ve uploaded the design files',
      contentType: 'text',
      readBy: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
    }
  }
];

export const mockMessages: Record<string, Message[]> = {
  'room1': [
    {
      _id: 'msg1-1',
      chatRoomId: 'room1',
      senderId: 'user2',
      content: 'Hi team, I wanted to discuss the project timeline.',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user2', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60)
    },
    {
      _id: 'msg1-2',
      chatRoomId: 'room1',
      senderId: 'user3',
      content: 'Sure, what aspects are you concerned about?',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user3', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 45)
    },
    {
      _id: 'msg1-3',
      chatRoomId: 'room1',
      senderId: 'user2',
      content: 'When is the next meeting?',
      contentType: 'text',
      readBy: [{ userId: 'user2', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 30)
    }
  ],
  'room2': [
    {
      _id: 'msg2-1',
      chatRoomId: 'room2',
      senderId: 'user2',
      content: 'Hey, do you have a minute to help me with something?',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user2', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 20)
    },
    {
      _id: 'msg2-2',
      chatRoomId: 'room2',
      senderId: 'user1',
      content: 'Of course, what do you need?',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 15)
    },
    {
      _id: 'msg2-3',
      chatRoomId: 'room2',
      senderId: 'user2',
      content: 'I need help with the API integration.',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user2', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 10)
    },
    {
      _id: 'msg2-4',
      chatRoomId: 'room2',
      senderId: 'user1',
      content: 'Thanks for your help!',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 5)
    }
  ],
  'room3': [
    {
      _id: 'msg3-1',
      chatRoomId: 'room3',
      senderId: 'user1',
      content: 'How are we doing on the design phase?',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user3', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3)
    },
    {
      _id: 'msg3-2',
      chatRoomId: 'room3',
      senderId: 'user3',
      content: 'Almost done, just finalizing some details.',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user3', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5), // 2.5 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5)
    },
    {
      _id: 'msg3-3',
      chatRoomId: 'room3',
      senderId: 'user3',
      content: 'I&#39;ve uploaded the design files',
      contentType: 'text',
      readBy: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
    }
  ]
}; 