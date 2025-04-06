"use client";

import React from 'react';
import { ChatRoom, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft } from 'lucide-react';
import { USERS_SERVICE_URL } from '@/constants/API_URLS';

interface ChatHeaderProps {
  room: ChatRoom;
  onBackClick: () => void;
  currentUserId?: string;
  users: Record<string, User>;
}

export default function ChatHeader({ room, onBackClick, currentUserId, users }: ChatHeaderProps) {
  // Get user name from ID
  const getUserName = (userId: string) => {
    const user = users[userId];
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  // Get user avatar from ID
  const getUserAvatar = (userId: string) => {
    const user = users[userId];
    return user?.avatar || '';
  };

  // Get user initials from ID
  const getUserInitials = (userId: string) => {
    const user = users[userId];
    return user ? `${user.firstName[0]}${user.lastName[0]}` : 'UN';
  };

  return (
    <div className="p-4 border-b dark:border-gray-800 flex items-center gap-3 shrink-0">
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden" 
        onClick={onBackClick}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      
      {room.type === 'direct' ? (
        <Avatar>
          <AvatarImage src={getUserAvatar(room.participants.find(id => id !== currentUserId) || '') ? USERS_SERVICE_URL + getUserAvatar(room.participants.find(id => id !== currentUserId) || '') : ''} />
          <AvatarFallback className='bg-gradient-to-br from-blue-400 to-blue-600 text-white'>{getUserInitials(room.participants.find(id => id !== currentUserId) || '')}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <span className="text-sm font-medium">{room.name.substring(0, 2).toUpperCase()}</span>
        </div>
      )}
      
      <div>
        <h3 className="font-medium dark:text-white">{room.name}</h3>
        {room.type === 'project' ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {room.participants.length} participants
          </p>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {getUserName(room.participants.find(id => id !== currentUserId) || '')}
          </p>
        )}
      </div>
    </div>
  );
} 