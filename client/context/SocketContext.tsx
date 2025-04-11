"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { CHAT_SERVICE_URL, NOTIFICATION_SERVICE_URL } from '@/constants/API_URLS';
import { addNotification } from '@/lib/features/NotificationsSlice';
import { addInvitation, updateInvitation } from '@/lib/features/InvitationsSlice';

// Create a global socket instance outside of the component
let globalSocket: Socket | null = null;

interface SocketContextType {
  socket: Socket | null;
  notificationSocket: Socket | null;
  isConnected: boolean;
  isNotificationConnected: boolean;
  joinRoom: (roomId: string) => boolean;
  leaveRoom: (roomId: string) => void;
  typingUsers: Record<string, string[]>; // roomId -> array of user IDs who are typing
  sendTypingStatus: (roomId: string, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  notificationSocket: null,
  isConnected: false,
  isNotificationConnected: false,
  joinRoom: () => false,
  leaveRoom: () => {},
  typingUsers: {},
  sendTypingStatus: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useSelector((state: RootState) => state.user);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notificationSocket, setNotificationSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isNotificationConnected, setIsNotificationConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const socketInitializedRef = useRef(false);
  const notificationSocketInitializedRef = useRef(false);
  const dispatch = useDispatch();

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
      setIsConnected(true);
      
      if (globalSocket) {
        globalSocket.emit('authenticate', user.id);
      }
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
  }, [token, user?.id, dispatch]);

  // Initialize notification socket connection
  useEffect(() => {
    if (notificationSocketInitializedRef.current || !token || !user?.id) return;
    
    console.log('Initializing notification socket connection...');
    
    // Create a new socket connection without auth in handshake
    const newNotificationSocket = io(NOTIFICATION_SERVICE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
        
    setNotificationSocket(newNotificationSocket);
    notificationSocketInitializedRef.current = true;
    
    newNotificationSocket.on('connect', () => {
      console.log("Notification socket connected, authenticating...");
      
      // Send authentication after connection
      newNotificationSocket.emit('authenticate', token);
      
      // Join user's notification room
      newNotificationSocket.emit('join', user.id);
    });
    
    // Listen for authentication confirmation
    newNotificationSocket.on('authenticated', (response) => {
      if (response.status === 'success') {
        console.log('Successfully authenticated with notification service');
        setIsNotificationConnected(true);
      } else {
        console.error('Authentication failed:', response.message);
        setIsNotificationConnected(false);
      }
    });

    newNotificationSocket.on('disconnect', () => {
      console.log('Notification socket disconnected');
      setIsNotificationConnected(false);
    });

    // Listen for new notifications
    newNotificationSocket.on('new_notification', (notification) => {
      dispatch(addNotification(notification));
    });

    // Listen for new invitations
    newNotificationSocket.on('new_invitation', (invitation) => {
      dispatch(addInvitation(invitation));
    });

    // Listen for invitation updates
    newNotificationSocket.on('invitation_updated', (invitation) => {
      dispatch(updateInvitation(invitation));
    });
    
    return () => {
      if (newNotificationSocket) {
        newNotificationSocket.off('connect');
        newNotificationSocket.off('disconnect');
        newNotificationSocket.off('authenticated');
        newNotificationSocket.off('new_notification');
        newNotificationSocket.off('new_invitation');
        newNotificationSocket.off('invitation_updated');
      }
    };
  }, [token, user?.id, dispatch]);

  // Add reconnection logic to your socket context
  useEffect(() => {
    if (!socket) return;
    
    const handleReconnect = () => {
      // Remove console.log for performance
      // Emit an event to request latest data
      socket.emit('request_latest_data');
    };
    
    socket.on('connect', handleReconnect);
    socket.on('reconnect', handleReconnect);
    
    return () => {
      socket.off('connect', handleReconnect);
      socket.off('reconnect', handleReconnect);
    };
  }, [socket]);

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
    // Remove console.log for performance
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
      notificationSocket,
      isConnected, 
      isNotificationConnected,
      joinRoom,
      leaveRoom,
      typingUsers,
      sendTypingStatus
    }}>
      {children}
    </SocketContext.Provider>
  );
}; 