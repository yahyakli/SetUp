"use client";

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { ChatRoom, User, Message } from '@/types';
import ChatRoomsList from '@/components/chat/ChatRoomsList';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';
import EmptyState from '@/components/chat/EmptyState';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { CHAT_SERVICE_URL, USERS_SERVICE_URL } from '@/constants/API_URLS';
import { useSocket } from '@/lib/socket/SocketContext';

export default function ChatPage() {
  const { user, token } = useSelector((state: RootState) => state.user);
  const { teams } = useSelector((state: RootState) => state.teams);
  const router = useRouter();
  const params = useParams();
  const roomId = params?.roomId as string;
  const { socket } = useSocket();

  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [showChatList, setShowChatList] = useState(true);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    // Initialize from localStorage if available, otherwise use default width
    if (typeof window !== 'undefined') {
      const savedWidth = localStorage.getItem('chatSidebarWidth');
      return savedWidth ? parseInt(savedWidth, 10) : 320;
    }
    return 320;
  });
  const [isMobile, setIsMobile] = useState(false);

  // Fetch team users and chat rooms
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !user?.id) return;
      
      setLoading(true);
      
      try {
        // 1. First collect all user IDs from teams
        const userIds = new Set<string>();
        
        teams.forEach(team => {
          if (team.members && team.members.length > 0) {
            team.members.forEach(member => {
              if (member.user_id !== user.id) { // Exclude current user
                userIds.add(member.user_id);
              }
            });
          }
        });
        
        // 2. Fetch chat rooms
        const roomsResponse = await axios.get(`${CHAT_SERVICE_URL}/api/chat-rooms/by-user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (roomsResponse.status === 200) {
          const rooms = roomsResponse.data;
          setChatRooms(rooms);
          
          // Add participant IDs to the set of users to fetch
          rooms.forEach((room: ChatRoom) => {
            if (room.participants) {
              room.participants.forEach((participantId: string) => {
                userIds.add(participantId);
              });
            }
            
            if (room.lastMessage && room.lastMessage.senderId) {
              userIds.add(room.lastMessage.senderId);
            }
          });
          
          // 3. Fetch all users in a single batch request
          if (userIds.size > 0) {
            const userResponse = await axios.post(
              `${USERS_SERVICE_URL}/api/users/batch`,
              Array.from(userIds),
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            if (userResponse.status === 200) {
              const fetchedUsers = userResponse.data;
              const usersMap: Record<string, User> = {};
              
              fetchedUsers.forEach((fetchedUser: User) => {
                usersMap[fetchedUser.id] = fetchedUser;
              });
              
              setUsers(usersMap);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, user?.id, teams]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket || !user?.id) return;

    // Listen for new messages
    socket.on('new_message', (message: Message) => {
      // Update messages for the relevant chat room
      setMessages(prev => {
        const roomMessages = prev[message.chatRoomId] || [];
        return {
          ...prev,
          [message.chatRoomId]: [message, ...roomMessages]
        };
      });

      // Update the last message in chat rooms list
      setChatRooms(prev => {
        return prev.map(room => {
          if (room._id === message.chatRoomId) {
            return {
              ...room,
              lastMessage: {
                _id: message._id,
                chatRoomId: message.chatRoomId,
                content: message.content,
                contentType: message.contentType || 'text',
                senderId: message.senderId,
                readBy: message.readBy || [],
                createdAt: message.createdAt,
                updatedAt: message.updatedAt || message.createdAt
              }
            };
          }
          return room;
        });
      });
    });

    // Listen for messages being read
    socket.on('messages_read', ({ messageIds, userId, readAt }) => {
      if (userId === user.id) return; // Skip if it's the current user

      // Update read status for messages
      setMessages(prev => {
        const updatedMessages = { ...prev };
        
        Object.keys(updatedMessages).forEach(roomId => {
          updatedMessages[roomId] = updatedMessages[roomId].map(msg => {
            if (messageIds.includes(msg._id)) {
              // Check if this user has already read the message
              const hasRead = msg.readBy?.some(read => read.userId === userId);
              
              if (!hasRead) {
                return {
                  ...msg,
                  readBy: [...(msg.readBy || []), { userId, readAt }]
                };
              }
            }
            return msg;
          });
        });
        
        return updatedMessages;
      });
    });

    // Listen for new chat rooms
    socket.on('new_chat_room', (room: ChatRoom) => {
      setChatRooms(prev => [room, ...prev]);
    });

    // Listen for updated chat rooms
    socket.on('update_chat_room', (updatedRoom: ChatRoom) => {
      setChatRooms(prev => 
        prev.map(room => room._id === updatedRoom._id ? updatedRoom : room)
      );
    });

    // Listen for deleted chat rooms
    socket.on('chat_room_deleted', ({ chatRoomId }) => {
      setChatRooms(prev => prev.filter(room => room._id !== chatRoomId));
      
      // If the deleted room is currently selected, navigate away
      if (selectedRoom?._id === chatRoomId) {
        router.push('/chat');
      }
    });

    // Clean up listeners on unmount
    return () => {
      socket.off('new_message');
      socket.off('messages_read');
      socket.off('new_chat_room');
      socket.off('update_chat_room');
      socket.off('chat_room_deleted');
    };
  }, [socket, user?.id, selectedRoom, router]);

  // Join the selected chat room's socket channel
  useEffect(() => {
    if (!socket || !selectedRoom) return;
    
    const roomId = String(selectedRoom._id); // Convert to string to ensure consistency
    
    console.log(`Joining socket room: ${roomId}`);
    
    // Join the room's socket channel - ensure this is only done once per room
    socket.emit('join_room', roomId);
    
    // Leave the room when component unmounts or room changes
    return () => {
      console.log(`Leaving socket room: ${roomId}`);
      socket.emit('leave_room', roomId);
    };
  }, [socket, selectedRoom?._id]); // Only depend on _id, not the entire selectedRoom object

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

  // Set selected room based on URL parameter
  useEffect(() => {
    if (roomId && chatRooms.length > 0) {
      const room = chatRooms.find(room => room._id === roomId);
      if (room) {
        setSelectedRoom(room);
        // On mobile, hide the chat list when a room is selected
        if (isMobile) {
          setShowChatList(false);
        }
        
        // Fetch messages for this room if we haven't already
        if (!messages[roomId]) {
          fetchMessagesForRoom(roomId);
        }
      }
    } else {
      setSelectedRoom(null);
      // On mobile, show the chat list when no room is selected
      if (isMobile) {
        setShowChatList(true);
      }
    }
  }, [roomId, chatRooms, isMobile]);

  // Fetch messages for a specific room
  const fetchMessagesForRoom = async (roomId: string) => {
    if (!token) return;
    
    try {
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
      }
    } catch (error) {
      console.error(`Error fetching messages for room ${roomId}:`, error);
    }
  };

  // Get messages for selected room
  const currentMessages = selectedRoom && messages[selectedRoom._id] ? messages[selectedRoom._id] : [];

  // Handle room selection
  const handleRoomSelect = (room: ChatRoom) => {
    // Update the URL with the selected room ID
    router.push(`/chat/${room._id}`);
    
    // Fetch messages if we haven't already
    if (!messages[room._id]) {
      fetchMessagesForRoom(room._id);
    }
  };

  // Handle back button on mobile
  const handleBackToList = () => {
    setShowChatList(true);
    // Remove room ID from URL
    router.push('/chat');
  };

  // Handle sidebar resize
  const handleSidebarResize = (width: number) => {
    setSidebarWidth(width);
    // Save to localStorage
    localStorage.setItem('chatSidebarWidth', width.toString());
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
              />
            </div>

            <ChatInput selectedRoom={selectedRoom} />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
} 