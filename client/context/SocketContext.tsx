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
    
    // Use the global socket if it exists, otherwise create a new one
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
    
    // Set up event listeners
    globalSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setIsConnected(true);
      
      // Authenticate with user ID
      if (globalSocket) {
        globalSocket.emit('authenticate', user.id);
        console.log(`Sent authentication for user ${user.id}`);
      }
    });

    globalSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      // Clear typing users on disconnect
      setTypingUsers({});
    });

    // Add more detailed error logging
    globalSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    // Listen for typing indicator events
    globalSocket.on('user_typing', ({ userId, isTyping }) => {
      console.log('Received typing event:', { userId, isTyping });
      
      // Skip processing if userId is undefined
      if (!userId) {
        console.warn('Received typing event with undefined userId, ignoring');
        return;
      }
      
      // Get the active room from the event
      setTypingUsers(prevTypingUsers => {
        // Create a new object to avoid mutating state
        const newTypingUsers = { ...prevTypingUsers };
        
        // Update all rooms where this user might be typing
        Object.keys(newTypingUsers).forEach(roomId => {
          if (isTyping) {
            // If user is typing, add them to the room's typing users (if not already there)
            if (!newTypingUsers[roomId].includes(userId)) {
              newTypingUsers[roomId] = [...newTypingUsers[roomId], userId];
            }
          } else {
            // If user stopped typing, remove them from the room's typing users
            newTypingUsers[roomId] = newTypingUsers[roomId].filter(id => id !== userId);
          }
        });
        
        return newTypingUsers;
      });
    });
    
    // Clean up on unmount - but don't disconnect the socket
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
      socket.emit('typing', { roomId, isTyping, userId: user.id });
    }
  };

  // Join a chat room
  const joinRoom = (roomId: string) => {
    if (socket && isConnected) {
      console.log(`Joining room: ${roomId}`);
      socket.emit('join_room', roomId);
      
      // Initialize typing users for this room if not already done
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
      console.log(`Leaving room: ${roomId}`);
      socket.emit('leave_room', roomId);
      
      // Clean up typing users for this room
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