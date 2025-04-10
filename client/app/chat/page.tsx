"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { ChatRoom, Message } from '@/types';
import ChatRoomsList from '@/components/chat/ChatRoomsList';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';
import EmptyState from '@/components/chat/EmptyState';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { CHAT_SERVICE_URL } from '@/constants/API_URLS';
import { useSocketEvents } from '@/hooks/useSocketEvents';
import { useChatRooms } from '@/hooks/useChatRooms';
import { useSocket } from '@/context/SocketContext';

export default function ChatPage() {
  const { user, token } = useSelector((state: RootState) => state.user);
  const { socket } = useSocket();
  const router = useRouter();
  const params = useParams();
  const roomId = params?.roomId as string;

  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [showChatList, setShowChatList] = useState(true);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    // Initialize from localStorage if available, otherwise use default width
    if (typeof window !== 'undefined') {
      const savedWidth = localStorage.getItem('chatSidebarWidth');
      return savedWidth ? parseInt(savedWidth, 10) : 320;
    }
    return 320;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Use the custom hook to get chat rooms and users
  const { chatRooms, users, loading, updateChatRooms, fetchUserData, fetchChatRooms } = useChatRooms();
  const apiCallsInProgressRef = useRef<Record<string, boolean>>({});

  // Use the custom hook for socket events
  useSocketEvents({
    userId: user?.id,
    selectedRoom,
    setMessages,
    setChatRooms: updateChatRooms,
    token,
    fetchUserData
  });

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

  // Memoize the fetch messages function to prevent unnecessary re-renders
  const fetchMessagesForRoom = useMemo(() => {
    return async (roomId: string) => {
      if (!token || !user?.id) return;

      // Don't fetch if we already have messages for this room
      if (messages[roomId] && messages[roomId].length > 0) {
        return;
      }

      // Prevent duplicate API calls
      if (apiCallsInProgressRef.current[`messages_${roomId}`]) {
        return;
      }

      apiCallsInProgressRef.current[`messages_${roomId}`] = true;

      try {
        console.log(`Fetching messages for room ${roomId}...`);
        const response = await axios.get(`${CHAT_SERVICE_URL}/api/messages/paginated/${roomId}/${user?.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          setMessages(prev => ({
            ...prev,
            [roomId]: response.data.messages
          }));
          setHasMoreMessages(response.data.pagination.hasMore);
        }
      } catch (error) {
        console.error(`Error fetching messages for room ${roomId}:`, error);
      } finally {
        apiCallsInProgressRef.current[`messages_${roomId}`] = false;
      }
    };
  }, [token, user?.id]);

  // Memoize chat rooms to prevent unnecessary re-renders
  const memoizedChatRooms = useMemo(() => chatRooms, [chatRooms]);

  // Set selected room based on URL parameter
  useEffect(() => {
    if (roomId && memoizedChatRooms.length > 0) {
      const room = memoizedChatRooms.find(room => room._id === roomId);
      if (room) {
        setSelectedRoom(room);
        // On mobile, hide the chat list when a room is selected
        if (isMobile) {
          setShowChatList(false);
        }

        // Fetch messages for this room if we haven't already
        fetchMessagesForRoom(roomId);
      }
    } else {
      setSelectedRoom(null);
      // On mobile, show the chat list when no room is selected
      if (isMobile) {
        setShowChatList(true);
      }
    }
  }, [roomId, memoizedChatRooms, isMobile, fetchMessagesForRoom]);

  // Function to load more messages
  const loadMoreMessages = async (roomId: string, lastMessageId: string) => {
    if (!token || !user?.id) return;

    // Prevent duplicate API calls
    if (apiCallsInProgressRef.current[`more_messages_${roomId}`]) {
      return;
    }

    apiCallsInProgressRef.current[`more_messages_${roomId}`] = true;

    try {
      console.log(`Loading more messages for room ${roomId} before message ${lastMessageId}...`);
      const response = await axios.get(
        `${CHAT_SERVICE_URL}/api/messages/more/${roomId}/${lastMessageId}/${user?.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        // Prepend the new messages to the existing ones
        setMessages(prev => ({
          ...prev,
          [roomId]: [...response.data.messages, ...(prev[roomId] || [])]
        }));
        setHasMoreMessages(response.data.hasMore);
      }
    } catch (error) {
      console.error(`Error loading more messages for room ${roomId}:`, error);
    } finally {
      apiCallsInProgressRef.current[`more_messages_${roomId}`] = false;
    }
  };

  // Get messages for selected room
  const currentMessages = selectedRoom && messages[selectedRoom._id] ? messages[selectedRoom._id] : [];

  // Get hasMoreMessages for selected room
  const currentRoomHasMoreMessages = selectedRoom ? hasMoreMessages : false;

  // Memoize the handleRoomSelect function
  const handleRoomSelect = useMemo(() => {
    return (room: ChatRoom) => {
      // Update the URL with the selected room ID
      router.push(`/chat/${room._id}`);

      // Fetch messages if we haven't already
      if (!messages[room._id] || messages[room._id].length === 0) {
        fetchMessagesForRoom(room._id);
      }
    };
  }, [router, messages, fetchMessagesForRoom]);

  // Handle back button on mobile
  const handleBackToList = () => {
    setShowChatList(true);
    // Remove room ID from URL
    router.push('/chat');
    // Refresh chat rooms when returning to the list
    setTimeout(refreshChatRooms, 100);
  };

  // Handle sidebar resize
  const handleSidebarResize = (width: number) => {
    setSidebarWidth(width);
    // Save to localStorage
    localStorage.setItem('chatSidebarWidth', width.toString());
  };

  // Add this ref at the component level
  const joinedRef = useRef(false);

  // Modify the useEffect for joining rooms
  useEffect(() => {
    if (!socket || !chatRooms.length || !user?.id) return;
    
    console.log('Joining all chat rooms');
    
    // Function to join all rooms
    const joinAllRooms = () => {
      // Only join if we haven't already joined in this render cycle
      if (!joinedRef.current) {
        joinedRef.current = true;
        
        chatRooms.forEach(room => {
          socket.emit('join_room', room._id);
          console.log(`Joined room: ${room._id}`);
        });
      }
    };
    
    // Join immediately
    joinAllRooms();
    
    // Also join on reconnection
    socket.on('connect', joinAllRooms);
    
    return () => {
      // Clean up
      socket.off('connect', joinAllRooms);
      joinedRef.current = false;
      
      // Only leave the rooms if we're completely unmounting
      if (window.location.pathname !== '/chat' && !window.location.pathname.startsWith('/chat/')) {
        chatRooms.forEach(room => {
          socket.emit('leave_room', room._id);
        });
      }
    };
  }, [socket, chatRooms, user?.id]);

  // Add debouncing to refreshChatRooms
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refreshChatRooms = useCallback(() => {
    if (!socket || !chatRooms.length) return;
    
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Set a new timeout to debounce the refresh
    refreshTimeoutRef.current = setTimeout(() => {
      console.log('Manually refreshing chat rooms');
      
      // Request last message updates for all rooms
      chatRooms.forEach(room => {
        if (room.lastMessage) {
          socket.emit('update_last_message', {
            roomId: room._id,
            message: room.lastMessage
          });
        }
      });
      
      refreshTimeoutRef.current = null;
    }, 1000); // Debounce for 1 second
  }, [socket, chatRooms]);

  // Add this useEffect to trigger the refresh when returning to the chat list
  useEffect(() => {
    if (isMobile && showChatList && chatRooms.length > 0) {
      // When returning to the chat list on mobile, refresh the rooms
      refreshChatRooms();
    }
  }, [isMobile, showChatList, chatRooms, refreshChatRooms]);

  // Add this useEffect for socket reconnection
  useEffect(() => {
    if (!socket) return;
    
    const handleReconnect = () => {
      console.log('Socket reconnected - refreshing chat rooms');
      
      // Rejoin all rooms
      chatRooms.forEach(room => {
        socket.emit('join_room', room._id);
      });
      
      // Request last message updates
      refreshChatRooms();
    };
    
    socket.on('connect', handleReconnect);
    
    return () => {
      socket.off('connect', handleReconnect);
    };
  }, [socket, chatRooms]);

  // This effect runs when the component mounts
  useEffect(() => {
    // Force refresh chat rooms when the component mounts
    if (fetchChatRooms) {
      fetchChatRooms(true); // Pass true to force a refresh
    }
  }, []); // Empty dependency array means this runs once when mounted

  // Handler for selecting a message to reply to
  const handleReplyMessage = (message: Message) => {
    setReplyingTo(message);
  };
  
  // Handler for canceling a reply
  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Chat Rooms List - Hidden on mobile when a chat is selected */}
      <div
        className={`${showChatList ? 'flex' : 'hidden'
          } md:flex flex-col h-full ${isMobile ? 'w-full' : ''}`}
      >
        <ChatRoomsList
          chatRooms={chatRooms}
          loading={loading}
          selectedRoom={selectedRoom}
          onRoomSelect={handleRoomSelect}
          currentUserId={user?.id}
          users={users}
          onResize={handleSidebarResize}
          isMobile={isMobile}
        />
      </div>

      {/* Chat Messages - Hidden on mobile when no chat is selected */}
      <div
        className={`${!showChatList ? 'flex' : 'hidden'
          } md:flex flex-col flex-1 h-full`}
        style={isMobile ? {} : { width: `calc(100% - ${sidebarWidth}px)` }}
      >
        {selectedRoom ? (
          <>
            <ChatHeader
              room={selectedRoom}
              onBackClick={handleBackToList}
              currentUserId={user?.id}
              users={users}
            />

            <div className="flex-1 overflow-hidden">
              <ChatMessageList
                messages={currentMessages}
                currentUserId={user?.id}
                users={users}
                showUserInfo={selectedRoom.type === 'project'}
                roomId={selectedRoom._id}
                onLoadMoreMessages={(lastMessageId) =>
                  loadMoreMessages(selectedRoom._id, lastMessageId)
                }
                hasMoreMessages={currentRoomHasMoreMessages}
                roomType={selectedRoom.type}
                onReplyMessage={handleReplyMessage}
              />
            </div>

            <ChatInput 
              selectedRoom={selectedRoom} 
              replyingTo={replyingTo}
              onCancelReply={handleCancelReply}
              users={users}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
} 