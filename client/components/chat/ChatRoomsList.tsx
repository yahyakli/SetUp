"use client";

import React, { useState, useRef } from 'react';
import { ChatRoom, User } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, GripVertical, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import UserSelectionModal from './UserSelectionModal';
import { useMemo } from 'react';
import { USERS_SERVICE_URL } from '@/constants/API_URLS';

interface ChatRoomsListProps {
  selectedRoom: ChatRoom | null;
  onRoomSelect: (room: ChatRoom) => void;
  currentUserId?: string;
  users: Record<string, User>;
  onResize?: (width: number) => void;
  isMobile?: boolean;
  chatRooms: ChatRoom[];
  loading: boolean;
}

export default function ChatRoomsList({
  chatRooms,
  loading,
  selectedRoom,
  onRoomSelect,
  currentUserId,
  users,
  onResize,
  isMobile = false
}: ChatRoomsListProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [chatFilter, setChatFilter] = React.useState<'all' | 'direct' | 'project'>('all');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  // Initialize width from props or localStorage
  const [width, setWidth] = useState(() => {
    if (typeof window !== 'undefined' && !isMobile) {
      const savedWidth = localStorage.getItem('chatSidebarWidth');
      return savedWidth ? parseInt(savedWidth, 10) : 320;
    }
    return 320;
  });
  
  const minWidth = 250;
  const maxWidth = 500;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);


  // Filter chat rooms based on search query and filter type - using useMemo for performance
  const filteredChatRooms = useMemo(() => {
    return chatRooms.filter(room => {
      // For direct chats, we need to find the other participant's name
      let matchesSearch = true;
      
      if (searchQuery) {
        if (room.type === 'direct') {
          // For direct chats, search by the other participant's name
          const otherParticipantId = room.participants.find(id => id !== currentUserId);
          const otherUser = otherParticipantId ? users[otherParticipantId] : null;
          
          if (otherUser) {
            const fullName = `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();
            matchesSearch = fullName.includes(searchQuery.toLowerCase());
          } else {
            // If we can't find the other user, use the room name as fallback
            matchesSearch = (room.name || '').toLowerCase().includes(searchQuery.toLowerCase());
          }
        } else {
          // For project chats, search by room name
          matchesSearch = (room.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        }
      }
      
      const matchesFilter = 
        chatFilter === 'all' || 
        (chatFilter === 'direct' && room.type === 'direct') || 
        (chatFilter === 'project' && room.type === 'project');
      
      return matchesSearch && matchesFilter;
    });
  }, [chatRooms, searchQuery, chatFilter, currentUserId, users]);

  // Format date for chat list
  const formatChatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return format(date, 'h:mm a');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  // Get user initials from ID
  const getUserInitials = (userId: string) => {
    const user = users[userId];
    return user ? `${user.firstName[0]}${user.lastName[0]}` : 'UN';
  };

  // Get user avatar from ID
  const getUserAvatar = (userId: string) => {
    const user = users[userId];
    return user?.avatar || '';
  };

  // Handle mouse down on resizer
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
    
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = width;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
        if (onResize) {
          onResize(newWidth);
        }
        // Save to localStorage directly here as well
        localStorage.setItem('chatSidebarWidth', newWidth.toString());
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-full border-r dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-hidden relative"
      style={isMobile ? {} : { width: `${width}px` }}
    >
      <div className="p-4 border-b dark:border-gray-800 shrink-0 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold dark:text-white">Messages</h2>
          <Button 
            size="sm" 
            onClick={() => setIsUserModalOpen(true)}
            className="dark:hover:bg-gray-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
          />
        </div>
        <Tabs value={chatFilter} className="mt-4" onValueChange={(value) => setChatFilter(value as 'all' | 'direct' | 'project')}>
          <TabsList className="w-full bg-gray-100 dark:bg-gray-700">
            <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600">All</TabsTrigger>
            <TabsTrigger value="direct" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600">Direct</TabsTrigger>
            <TabsTrigger value="project" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600">Projects</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredChatRooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No conversations found
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-800">
            {filteredChatRooms.map((room) => {
              const lastMessage = room.lastMessage;
              const isUnread = lastMessage && !lastMessage.readBy.some(read => read.userId === currentUserId);
              return (
                <div
                  key={room._id}
                  className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    selectedRoom?._id === room._id ? 'bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500 dark:border-blue-400' : ''
                  }`}
                  onClick={() => onRoomSelect(room)}
                >
                  <div className="flex items-start gap-3">
                    {room.type === 'direct' ? (
                      <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800 shadow-sm">
                        <AvatarImage src={getUserAvatar(room.participants.find(id => id !== currentUserId) || '') ? USERS_SERVICE_URL + getUserAvatar(room.participants.find(id => id !== currentUserId) || '') : ''} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                          {getUserInitials(room.participants.find(id => id !== currentUserId) || '')}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white shadow-sm">
                        <span className="text-sm font-medium">{room.name.substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className={`font-medium truncate dark:text-white ${isUnread ? 'font-bold' : ''}`}>
                          {room.type === 'direct' ? (
                            (() => {
                              const otherParticipantId = room.participants.find(id => id !== currentUserId);
                              const otherUser = otherParticipantId ? users[otherParticipantId] : null;
                              
                              if (otherUser) {
                                return `${otherUser.firstName} ${otherUser.lastName}`;
                              } else {
                                // Fallback to room name if user not found
                                return room.name || 'Direct Message';
                              }
                            })()
                          ) : (
                            room.name
                          )}
                        </h3>
                        {lastMessage && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {formatChatDate(new Date(lastMessage.createdAt))}
                          </span>
                        )}
                      </div>
                      
                      {lastMessage && (
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate ${
                            isUnread 
                              ? 'text-gray-900 dark:text-gray-100 font-medium' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {lastMessage.senderId === currentUserId ? 'You: ' : ''}
                            {lastMessage.content || 'File or Image'}
                          </p>
                          
                          {isUnread && (
                            <Badge variant="default" className="ml-2 h-3 w-3 rounded-full p-0 flex items-center justify-center bg-blue-500"></Badge>
                          )}
                        </div>
                      )}
                      
                      {room.type === 'project' && (
                        <Badge variant="outline" className="mt-1 text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">Project</Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Resizer handle - only visible on desktop */}
      {!isMobile && (
        <div 
          onMouseDown={handleMouseDown}
          className={`absolute top-0 right-0 w-2 h-full z-10 hidden md:block ${
            isResizing ? 'cursor-col-resize' : 'cursor-default hover:cursor-col-resize'
          }`}
          style={{ transform: 'translateX(50%)' }}
        >
          <div className={`absolute top-0 bottom-0 left-1/2 w-1 transform -translate-x-1/2 ${
            isResizing ? 'bg-blue-500' : 'bg-transparent hover:bg-blue-500'
          } transition-colors`}></div>
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-300 dark:bg-gray-600 rounded-full p-1 shadow-md opacity-0 hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
        </div>
      )}
      
      {/* Add the user selection modal */}
      <UserSelectionModal   
        chatRooms={chatRooms}
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
      />
    </div>
  );
} 