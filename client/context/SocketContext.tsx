"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { CHAT_SERVICE_URL } from '@/constants/API_URLS';

// Create a global socket instance outside of the component
let globalSocket: Socket | null = null;

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => boolean;
  leaveRoom: (roomId: string) => void;
  typingUsers: Record<string, string[]>; // roomId -> array of user IDs who are typing
  sendTypingStatus: (roomId: string, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinRoom: () => false,
  leaveRoom: () => {},
  typingUsers: {},
  sendTypingStatus: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useSelector((state: RootState) => state.user);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const socketInitializedRef = useRef(false);

  // Initialize socket connection only once
  useEffect(() => {
    if (socketInitializedRef.current || !token || !user?.id) return;
    
    console.log('Initializing socket connection...');
    
    if (!globalSocket) {
      globalSocket = io(CHAT_SERVICE_URL, {
        auth: {
          token
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
    }
    
    setSocket(globalSocket);
    socketInitializedRef.current = true;
    
    globalSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setIsConnected(true);
      
      if (globalSocket) {
        globalSocket.emit('authenticate', user.id);
      }
    });

    globalSocket.on('last_message_updated', (data) => {
      console.log('🔄 Received last_message_updated event:', data);
    });

    globalSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setTypingUsers({});
    });

    globalSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    globalSocket.on('user_typing', ({ userId, isTyping, roomId }) => {
      if (!userId) {
        console.warn('Received typing event with undefined userId, ignoring');
        return;
      }
      
      setTypingUsers(prev => {
        const newTypingUsers = { ...prev };
        
        if (!newTypingUsers[roomId]) {
          newTypingUsers[roomId] = [];
        }
        
        if (isTyping) {
          if (!newTypingUsers[roomId].includes(userId)) {
            newTypingUsers[roomId] = [...newTypingUsers[roomId], userId];
          }
        } else {
          newTypingUsers[roomId] = newTypingUsers[roomId].filter(id => id !== userId);
        }
        
        return newTypingUsers;
      });
    });
    
    return () => {
      if (globalSocket) {
        globalSocket.off('connect');
        globalSocket.off('disconnect');
        globalSocket.off('connect_error');
        globalSocket.off('user_typing');
      }
    };
  }, [token, user?.id]);

  // Send typing status to server
  const sendTypingStatus = (roomId: string, isTyping: boolean) => {
    if (socket && user?.id) {
      const isUserTypingInRoom = typingUsers[roomId]?.includes(user.id);
      
      if ((isTyping && !isUserTypingInRoom) || (!isTyping && isUserTypingInRoom)) {
        socket.emit('typing', { roomId, isTyping, userId: user.id });
        
        setTypingUsers(prev => {
          const newTypingUsers = { ...prev };
          
          if (isTyping) {
            newTypingUsers[roomId] = [...(newTypingUsers[roomId] || []), user.id];
          } else {
            newTypingUsers[roomId] = (newTypingUsers[roomId] || []).filter(id => id !== user.id);
          }
          
          return newTypingUsers;
        });
      }
    }
  };

  // Join a chat room
  const joinRoom = (roomId: string) => {
    if (socket && isConnected) {
      socket.emit('join_room', roomId);
      
      setTypingUsers(prev => {
        if (!prev[roomId]) {
          return { ...prev, [roomId]: [] };
        }
        return prev;
      });
      
      return true;
    }
    console.log('Could not join room - socket not connected');
    return false;
  };
  
  // Add a function to leave a room
  const leaveRoom = (roomId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_room', roomId);
      
      setTypingUsers(prev => {
        const newTypingUsers = { ...prev };
        delete newTypingUsers[roomId];
        return newTypingUsers;
      });
    }
  };

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      joinRoom,
      leaveRoom,
      typingUsers,
      sendTypingStatus
    }}>
      {children}
    </SocketContext.Provider>
  );
}; 