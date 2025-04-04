"use client";

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
  },
  'user4': {
    id: 'user4',
    firstName: 'Sarah',
    lastName: 'Johnson',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson',
    email: 'sarah@example.com',
    role: 'user',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  'user5': {
    id: 'user5',
    firstName: 'Michael',
    lastName: 'Brown',
    avatar: 'https://ui-avatars.com/api/?name=Michael+Brown',
    email: 'michael@example.com',
    role: 'user',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  'user6': {
    id: 'user6',
    firstName: 'Emily',
    lastName: 'Davis',
    avatar: 'https://ui-avatars.com/api/?name=Emily+Davis',
    email: 'emily@example.com',
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
  },
  {
    _id: 'room4',
    name: 'Marketing Team',
    type: 'project',
    projectId: 3,
    participants: ['user1', 'user4', 'user5'],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastMessage: {
      _id: 'msg4',
      chatRoomId: 'room4',
      senderId: 'user4',
      content: 'The campaign is ready to launch',
      contentType: 'text',
      readBy: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3)
    }
  },
  {
    _id: 'room5',
    name: 'Sarah Johnson',
    type: 'direct',
    participants: ['user1', 'user4'],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastMessage: {
      _id: 'msg5',
      chatRoomId: 'room5',
      senderId: 'user4',
      content: 'Can we discuss the project timeline?',
      contentType: 'text',
      readBy: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1)
    }
  },
  {
    _id: 'room6',
    name: 'Michael Brown',
    type: 'direct',
    participants: ['user1', 'user5'],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastMessage: {
      _id: 'msg6',
      chatRoomId: 'room6',
      senderId: 'user5',
      content: 'I&#39;ve reviewed your proposal',
      contentType: 'text',
      readBy: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 45)
    }
  },
  {
    _id: 'room7',
    name: 'Emily Davis',
    type: 'direct',
    participants: ['user1', 'user6'],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastMessage: {
      _id: 'msg7',
      chatRoomId: 'room7',
      senderId: 'user1',
      content: 'Let me know when you&#39;re available',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 120)
    }
  },
  {
    _id: 'room8',
    name: 'Project Horizon',
    type: 'project',
    projectId: 4,
    participants: ['user1', 'user2', 'user4', 'user6'],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastMessage: {
      _id: 'msg8',
      chatRoomId: 'room8',
      senderId: 'user6',
      content: 'The client approved our proposal!',
      contentType: 'text',
      readBy: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 10)
    }
  },
  {
    _id: 'room9',
    name: 'Development Team',
    type: 'project',
    projectId: 5,
    participants: ['user1', 'user3', 'user5'],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastMessage: {
      _id: 'msg9',
      chatRoomId: 'room9',
      senderId: 'user3',
      content: 'Sprint planning at 10 AM tomorrow',
      contentType: 'text',
      readBy: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 180)
    }
  },
  {
    _id: 'room10',
    name: 'Design Team',
    type: 'project',
    projectId: 6,
    participants: ['user1', 'user4', 'user6'],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastMessage: {
      _id: 'msg10',
      chatRoomId: 'room10',
      senderId: 'user4',
      content: 'New mockups are ready for review',
      contentType: 'text',
      readBy: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 240)
    }
  }
];

export const mockMessages: Record<string, Message[]> = {
  'room1': [
    {
      _id: 'msg1-1',
      chatRoomId: 'room1',
      senderId: 'user1',
      content: 'Good morning team! Let\'s discuss our progress on Project Falcon.',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user2', readAt: new Date() }, { userId: 'user3', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 120)
    },
    {
      _id: 'msg1-2',
      chatRoomId: 'room1',
      senderId: 'user3',
      content: 'I\'ve completed the backend integration for the user authentication module.',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user2', readAt: new Date() }, { userId: 'user3', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 115), // 1 hour 55 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 115)
    },
    {
      _id: 'msg1-3',
      chatRoomId: 'room1',
      senderId: 'user1',
      content: 'Great work! How about the dashboard components?',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user2', readAt: new Date() }, { userId: 'user3', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 110), // 1 hour 50 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 110)
    },
    {
      _id: 'msg1-4',
      chatRoomId: 'room1',
      senderId: 'user2',
      content: 'I\'m still working on the data visualization charts. Should be done by tomorrow.',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user2', readAt: new Date() }, { userId: 'user3', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 105), // 1 hour 45 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 105)
    },
    {
      _id: 'msg1-5',
      chatRoomId: 'room1',
      senderId: 'user3',
      content: 'I can help with the charts if needed. I have some experience with D3.js.',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user2', readAt: new Date() }, { userId: 'user3', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 100), // 1 hour 40 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 100)
    },
    {
      _id: 'msg1-6',
      chatRoomId: 'room1',
      senderId: 'user2',
      content: 'That would be great! Let\'s sync up after lunch.',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user2', readAt: new Date() }, { userId: 'user3', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 95), // 1 hour 35 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 95)
    },
    {
      _id: 'msg1-7',
      chatRoomId: 'room1',
      senderId: 'user1',
      content: 'What about the API documentation? Is it up to date?',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user2', readAt: new Date() }, { userId: 'user3', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 90), // 1 hour 30 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 90)
    },
    {
      _id: 'msg1-8',
      chatRoomId: 'room1',
      senderId: 'user3',
      content: 'I\'ve updated the docs with the latest endpoints. You can find them in the shared folder.',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user2', readAt: new Date() }, { userId: 'user3', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 85), // 1 hour 25 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 85)
    },
    {
      _id: 'msg1-9',
      chatRoomId: 'room1',
      senderId: 'user1',
      content: 'Perfect! I\'ll review them this afternoon.',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user2', readAt: new Date() }, { userId: 'user3', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 80), // 1 hour 20 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 80)
    },
    {
      _id: 'msg1-10',
      chatRoomId: 'room1',
      senderId: 'user2',
      content: 'By the way, the client requested a demo for next week. Are we on track?',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user2', readAt: new Date() }, { userId: 'user3', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 75), // 1 hour 15 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 75)
    },
    {
      _id: 'msg1-11',
      chatRoomId: 'room1',
      senderId: 'user1',
      content: 'I think we should be able to show the core features by then. Let\'s prioritize the essential modules.',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user2', readAt: new Date() }, { userId: 'user3', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 70), // 1 hour 10 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 70)
    },
    {
      _id: 'msg1-12',
      chatRoomId: 'room1',
      senderId: 'user3',
      content: 'I agree. I\'ll focus on polishing the user flow for the demo.',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user2', readAt: new Date() }, { userId: 'user3', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 65), // 1 hour 5 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 65)
    },
    {
      _id: 'msg1-13',
      chatRoomId: 'room1',
      senderId: 'user2',
      content: 'Should we schedule a rehearsal before the client demo?',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user2', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60)
    },
    {
      _id: 'msg1-14',
      chatRoomId: 'room1',
      senderId: 'user1',
      content: 'Definitely. Let\'s do a run-through on Monday morning.',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user2', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 55), // 55 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 55)
    },
    {
      _id: 'msg1-15',
      chatRoomId: 'room1',
      senderId: 'user3',
      content: 'Works for me. I\'ll prepare the test environment.',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user3', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 50), // 50 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 50)
    },
    {
      _id: 'msg1-16',
      chatRoomId: 'room1',
      senderId: 'user1',
      content: 'Great! Let\'s also make sure we have a backup plan in case of technical issues.',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 45)
    },
    {
      _id: 'msg1-17',
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
  ],
  // Add messages for the new chat rooms
  'room4': [
    {
      _id: 'msg4-1',
      chatRoomId: 'room4',
      senderId: 'user5',
      content: 'Has everyone reviewed the marketing materials?',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user5', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4)
    },
    {
      _id: 'msg4-2',
      chatRoomId: 'room4',
      senderId: 'user1',
      content: 'Yes, I sent my feedback yesterday.',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5), // 3.5 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5)
    },
    {
      _id: 'msg4-3',
      chatRoomId: 'room4',
      senderId: 'user4',
      content: 'The campaign is ready to launch',
      contentType: 'text',
      readBy: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3)
    }
  ],
  'room5': [
    {
      _id: 'msg5-1',
      chatRoomId: 'room5',
      senderId: 'user4',
      content: 'Hi John, do you have a moment?',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user4', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 90), // 90 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 90)
    },
    {
      _id: 'msg5-2',
      chatRoomId: 'room5',
      senderId: 'user1',
      content: 'Sure, what\'s up?',
      contentType: 'text',
      readBy: [{ userId: 'user1', readAt: new Date() }, { userId: 'user4', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 85), // 85 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 85)
    },
    {
      _id: 'msg5-3',
      chatRoomId: 'room5',
      senderId: 'user4',
      content: 'Can we discuss the project timeline?',
      contentType: 'text',
      readBy: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1)
    }
  ]
}; 