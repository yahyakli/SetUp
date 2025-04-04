"use client";

import React from 'react';
import { ChatRoom, User } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface ChatRoomsListProps {
  chatRooms: ChatRoom[];
  selectedRoom: ChatRoom | null;
  onRoomSelect: (room: ChatRoom) => void;
  currentUserId?: string;
  users: Record<string, User>;
}

export default function ChatRoomsList({
  chatRooms,
  selectedRoom,
  onRoomSelect,
  currentUserId,
  users
}: ChatRoomsListProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [chatFilter, setChatFilter] = React.useState<'all' | 'direct' | 'project'>('all');

  // Filter chat rooms based on search query and filter type
  const filteredChatRooms = chatRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      chatFilter === 'all' || 
      (chatFilter === 'direct' && room.type === 'direct') || 
      (chatFilter === 'project' && room.type === 'project');
    
    return matchesSearch && matchesFilter;
  });

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

  return (
    <div className="flex flex-col w-full h-full border-r dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="p-4 border-b dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={chatFilter} className="mt-4" onValueChange={(value) => setChatFilter(value as 'all' | 'direct' | 'project')}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="direct" className="flex-1">Direct</TabsTrigger>
            <TabsTrigger value="project" className="flex-1">Projects</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <ScrollArea className="flex-1">
        {filteredChatRooms.length === 0 ? (
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
                    selectedRoom?._id === room._id ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                  onClick={() => onRoomSelect(room)}
                >
                  <div className="flex items-start gap-3">
                    {room.type === 'direct' ? (
                      <Avatar>
                        <AvatarImage src={getUserAvatar(room.participants.find(id => id !== currentUserId) || '')} />
                        <AvatarFallback>{getUserInitials(room.participants.find(id => id !== currentUserId) || '')}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="text-sm font-medium">{room.name.substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className={`font-medium truncate dark:text-white ${isUnread ? 'font-bold' : ''}`}>
                          {room.name}
                        </h3>
                        {lastMessage && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {formatChatDate(lastMessage.createdAt)}
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
                            {lastMessage.content}
                          </p>
                          
                          {isUnread && (
                            <Badge variant="default" className="ml-2 h-2 w-2 rounded-full p-0">
                              <span className="sr-only">Unread</span>
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {room.type === 'project' && (
                        <Badge variant="outline" className="mt-1 text-xs">Project</Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t dark:border-gray-800">
        <Button className="w-full flex items-center gap-2" variant="outline">
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>
    </div>
  );
} 