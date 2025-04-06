import React from 'react';
import { useSocket } from '@/lib/socket/SocketContext';
import { User } from '@/types';

interface TypingIndicatorProps {
  roomId: string;
  currentUserId: string | undefined;
  users: Record<string, User>;
}

export default function TypingIndicator({ roomId, currentUserId, users }: TypingIndicatorProps) {
  const { typingUsers } = useSocket();
  
  // Get users who are typing in this room (excluding current user)
  const typingUserIds = (typingUsers[roomId] || [])
    .filter(userId => userId !== currentUserId);
  
  console.log('Typing users for room:', roomId, typingUserIds);
  
  if (typingUserIds.length === 0) {
    return null;
  }

  // Get user names for display
  const typingUserNames = typingUserIds.map(userId => {
    const user = users[userId];
    return user ? `${user.firstName} ${user.lastName}` : 'Someone';
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