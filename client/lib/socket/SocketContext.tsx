"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { CHAT_SERVICE_URL } from '@/constants/API_URLS';

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

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const { user, token } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // Only connect if we have a user and token
    if (!user?.id || !token) return;

    console.log('Attempting to connect socket...');
    
    // Create socket connection
    const socketInstance = io(CHAT_SERVICE_URL, {
      auth: {
        token
      }
    });

    // Set up event listeners
    socketInstance.on('connect', () => {
      console.log('Socket connected successfully');
      setIsConnected(true);
      
      // Authenticate with user ID
      socketInstance.emit('authenticate', user.id);
      console.log(`Sent authentication for user ${user.id}`);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      // Clear typing users on disconnect
      setTypingUsers({});
    });

    // Add more detailed error logging
    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    // Listen for typing indicator events
    socketInstance.on('user_typing', ({ userId, isTyping }) => {
      console.log('Received typing event:', { userId, isTyping });
      
      // We need to determine which room this typing event belongs to
      // Since the backend doesn't include roomId in the response,
      // we'll need to update our state based on the active room
      
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

    // Save socket instance
    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      console.log('Disconnecting socket');
      socketInstance.disconnect();
    };
  }, [user?.id, token]);

  // Add a function to explicitly join a room
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

  // Add a function to send typing status
  const sendTypingStatus = (roomId: string, isTyping: boolean) => {
    if (socket && isConnected && user) {
      console.log('Sending typing status:', { roomId, userId: user.id, isTyping });
      socket.emit('typing', {
        roomId,
        userId: user.id,
        isTyping
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