"use client";

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { ChatRoom } from '@/types';
import ChatRoomsList from '@/components/chat/ChatRoomsList';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';
import EmptyState from '@/components/chat/EmptyState';
import { mockChatRooms, mockMessages, mockUsers } from '@/components/chat/MockDataProvider';

export default function ChatPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [showChatList, setShowChatList] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Get messages for selected room
  const currentMessages = selectedRoom ? mockMessages[selectedRoom._id] || [] : [];

  // Handle room selection
  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    // On mobile, hide the chat list when a room is selected
    if (isMobile) {
      setShowChatList(false);
    }
  };

  // Handle back button on mobile
  const handleBackToList = () => {
    setShowChatList(true);
    setSelectedRoom(null);
  };

  // Handle sending a new message
  const handleSendMessage = (message: string) => {
    if (!selectedRoom) return;
    
    // In a real app, you would send this to your API
    console.log('Sending message:', message, 'to room:', selectedRoom._id);
  };

  // Handle sidebar resize
  const handleSidebarResize = (width: number) => {
    setSidebarWidth(width);
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Chat Rooms List - Hidden on mobile when a chat is selected */}
      <div 
        className={`${
          showChatList ? 'flex' : 'hidden'
        } md:flex flex-col h-full ${isMobile ? 'w-full' : ''}`}
      >
        <ChatRoomsList 
          chatRooms={mockChatRooms}
          selectedRoom={selectedRoom}
          onRoomSelect={handleRoomSelect}
          currentUserId={user?.id}
          users={mockUsers}
          onResize={handleSidebarResize}
          isMobile={isMobile}
        />
      </div>
      
      {/* Chat Messages - Hidden on mobile when no chat is selected */}
      <div 
        className={`${
          !showChatList ? 'flex' : 'hidden'
        } md:flex flex-col flex-1 h-full`}
        style={isMobile ? {} : { width: `calc(100% - ${sidebarWidth}px)` }}
      >
        {selectedRoom ? (
          <>
            <ChatHeader 
              room={selectedRoom}
              onBackClick={handleBackToList}
              currentUserId={user?.id}
              users={mockUsers}
            />
            
            <div className="flex-1 overflow-hidden">
              <ChatMessageList 
                messages={currentMessages}
                currentUserId={user?.id}
                users={mockUsers}
              />
            </div>
            
            <ChatInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
} 