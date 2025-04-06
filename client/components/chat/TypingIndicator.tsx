import React, { useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { User } from '@/types';

interface TypingIndicatorProps {
  roomId: string;
  currentUserId: string | undefined;
  users: Record<string, User>;
}

export default function TypingIndicator({ roomId, currentUserId, users }: TypingIndicatorProps) {
  const { typingUsers } = useSocket();
  
  // Debug the users object
  useEffect(() => {
    console.log('TypingIndicator - Users object:', users);
    console.log('TypingIndicator - Room ID:', roomId);
    console.log('TypingIndicator - Typing users state:', typingUsers);
  }, [users, roomId, typingUsers]);
  
  // Get users who are typing in this room (excluding current user)
  const typingUserIds = (typingUsers[roomId] || [])
    .filter(userId => userId !== currentUserId);
  
  if (typingUserIds.length === 0) {
    return null;
  }

  // Log the typing user IDs for debugging
  console.log('Typing user IDs:', typingUserIds);
  
  // Get user names for display with better error handling
  const typingUserNames = typingUserIds.map(userId => {
    try {
      // Check if users object exists and has the user
      if (!users) {
        console.log('Users object is undefined or null');
        return 'Someone';
      }
      
      const user = users[userId];
      if (!user) {
        console.log(`User with ID ${userId} not found in users object`);
        return 'Someone';
      }
      
      if (!user.firstName || !user.lastName) {
        console.log(`User ${userId} is missing firstName or lastName:`, user);
        return user.firstName || user.lastName || 'Someone';
      }
      
      return `${user.firstName} ${user.lastName}`;
    } catch (error) {
      console.error('Error getting user name:', error);
      return 'Someone';
    }
  });

  // Format the typing message
  let typingText = '';
  if (typingUserNames.length === 1) {
    typingText = `${typingUserNames[0]} is typing...`;
  } else if (typingUserNames.length === 2) {
    typingText = `${typingUserNames[0]} and ${typingUserNames[1]} are typing...`;
  } else if (typingUserNames.length === 3) {
    typingText = `${typingUserNames[0]}, ${typingUserNames[1]}, and ${typingUserNames[2]} are typing...`;
  } else {
    typingText = `${typingUserNames.length} people are typing...`;
  }

  return (
    <div className="flex items-center p-2 text-sm text-gray-500 dark:text-gray-400">
      <div className="typing-indicator mr-2">
        <span></span>
        <span></span>
        <span></span>
      </div>
      {typingText}
    </div>
  );
} 