"use client";

import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { Message, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { USERS_SERVICE_URL } from '@/constants/API_URLS';
import MessageAttachment from './MessageAttachment';
import TypingIndicator from './TypingIndicator';
import { useSocket } from '@/lib/socket/SocketContext';

interface ChatMessageListProps {
  messages: Message[];
  currentUserId?: string;
  users: Record<string, User>;
  showUserInfo?: boolean;
  roomId: string;
}

export default function ChatMessageList({ 
  messages, 
  currentUserId, 
  users, 
  showUserInfo = false,
  roomId
}: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const typingIndicatorRef = useRef<HTMLDivElement>(null);
  const { typingUsers } = useSocket();
  
  // Check if anyone is typing in this room (excluding current user)
  const isAnyoneTyping = (typingUsers[roomId] || [])
    .filter(userId => userId !== currentUserId)
    .length > 0;

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current && scrollContainerRef.current) {
      // Use scrollIntoView with a slight delay to ensure proper rendering
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      }, 100);
    }
  }, [messages]);
  
  // Scroll to typing indicator when someone starts typing
  useEffect(() => {
    if (isAnyoneTyping && typingIndicatorRef.current && scrollContainerRef.current) {
      // Use scrollIntoView with a slight delay to ensure proper rendering
      setTimeout(() => {
        typingIndicatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [isAnyoneTyping]);

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

  // Function to group messages by date - define this first
  const groupMessagesByDate = useCallback((messagesArray: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    
    // Ensure messages is a valid array
    const messageArray = Array.isArray(messagesArray) ? messagesArray : [];
    
    // First sort all messages by creation date
    const sortedMessages = [...messageArray].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    sortedMessages.forEach(message => {
      const messageDate = new Date(message.createdAt);
      const dateStr = format(messageDate, 'MMMM d, yyyy');
      
      const existingGroup = groups.find(group => group.date === dateStr);
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date: dateStr, messages: [message] });
      }
    });
    
    // Sort groups by date (oldest first)
    groups.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });
    
    return groups;
  }, []);

  // Now use the function in useMemo
  const messageGroups = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages, groupMessagesByDate]);

  // Check if there are no messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="mb-4 text-gray-400 dark:text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No messages yet</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Start the conversation by sending a message below.
          </p>
        </div>
      </div>
    );
  }

  const renderMessage = (message: Message, messageIndex: number, group: { date: string; messages: Message[] }) => {
    const isCurrentUser = message.senderId === currentUserId;
    const showAvatar = showUserInfo && messageIndex === 0 || 
      (showUserInfo && group.messages[messageIndex - 1].senderId !== message.senderId);
    
    return (
      <div 
        key={message._id} 
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`flex items-center gap-2 max-w-[80%] ${
          !isCurrentUser && !showAvatar && showUserInfo ? 'pl-10' : ''
        }`}>
          {!isCurrentUser && showAvatar && showUserInfo ? (
            <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
              <AvatarImage src={USERS_SERVICE_URL + getUserAvatar(message.senderId)} />
              <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white">
                {getUserInitials(message.senderId)}
              </AvatarFallback>
            </Avatar>
          ) : !isCurrentUser && showUserInfo ? (
            <div className="w-10 h-10 flex-shrink-0"></div>
          ) : null}
          
          <div>
            {!isCurrentUser && showAvatar && showUserInfo && (
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
              
              {/* Render attachments if they exist */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="message-attachments">
                  {message.attachments.map(attachment => (
                    <MessageAttachment 
                      key={attachment._id} 
                      attachment={attachment} 
                    />
                  ))}
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatMessageTime(message.createdAt)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col-reverse h-full overflow-y-auto p-4 space-y-reverse space-y-4">
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
                return renderMessage(message, messageIndex, group);
              })}
            </div>
          ))}
          
          {/* Add the typing indicator here with ref */}
          <div ref={typingIndicatorRef}>
            <TypingIndicator roomId={roomId} currentUserId={currentUserId} users={users} />
          </div>
          
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
} 