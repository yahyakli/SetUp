"use client";

import React, { useRef, useEffect } from 'react';
import { Message, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface ChatMessageListProps {
  messages: Message[];
  currentUserId?: string;
  users: Record<string, User>;
}

export default function ChatMessageList({ messages, currentUserId, users }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current && scrollContainerRef.current) {
      // Use scrollIntoView with a slight delay to ensure proper rendering
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      }, 100);
    }
  }, [messages]);

  // Format time for display
  const formatMessageTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

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

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    
    messages.forEach(message => {
      const messageDate = new Date(message.createdAt);
      const dateStr = format(messageDate, 'MMMM d, yyyy');
      
      const existingGroup = groups.find(group => group.date === dateStr);
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date: dateStr, messages: [message] });
      }
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900" ref={scrollContainerRef}>
      <div className="p-4 space-y-8">
        {messageGroups.map((group) => (
          <div key={group.date} className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                {group.date}
              </div>
            </div>
            
            {group.messages.map((message, messageIndex) => {
              const isCurrentUser = message.senderId === currentUserId;
              const showAvatar = messageIndex === 0 || 
                group.messages[messageIndex - 1].senderId !== message.senderId;
              
              return (
                <div 
                  key={message._id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-center gap-2 max-w-[80%] ${
                    !isCurrentUser && !showAvatar ? 'pl-10' : ''
                  }`}>
                    {!isCurrentUser && showAvatar ? (
                      <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
                        <AvatarImage src={getUserAvatar(message.senderId)} />
                        <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white">
                          {getUserInitials(message.senderId)}
                        </AvatarFallback>
                      </Avatar>
                    ) : !isCurrentUser ? (
                      <div className="w-10 h-10 flex-shrink-0"></div>
                    ) : null}
                    
                    <div>
                      {!isCurrentUser && showAvatar && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                          {getUserName(message.senderId)}
                        </p>
                      )}
                      
                      <div className={`rounded-2xl p-3 ${
                        isCurrentUser 
                          ? 'bg-blue-500 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none shadow-sm'
                      }`}>
                        <p>{message.content}</p>
                      </div>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
} 