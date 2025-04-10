import { useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { Message, ChatRoom, User } from '@/types';
import { useRouter } from 'next/navigation';

// Add this interface at the top of the file, after the imports
interface ReadReceipt {
  userId: string;
  readAt: Date;
}

export function useSocketEvents({
  userId,
  selectedRoom,
  setMessages,
  setChatRooms,
  fetchUserData
}: {
  userId?: string;
  selectedRoom: ChatRoom | null;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
  setChatRooms: (updatedRooms: React.SetStateAction<ChatRoom[]>) => void;
  token: string | null;
  fetchUserData?: (userId: string) => Promise<User>;
}) {
  const { socket } = useSocket();
  const router = useRouter();

  // Modify the helper function
  const updateChatRooms = (updater: (prev: ChatRoom[]) => ChatRoom[]) => {
    // Just pass the updater function directly to setChatRooms
    setChatRooms(updater as React.SetStateAction<ChatRoom[]>);
  };

  // Debounced update function to reduce frequent state changes
  const debouncedUpdateChatRooms = useCallback(
    (() => {
      let timeout: NodeJS.Timeout | null = null;
      let pendingUpdates: Record<string, { roomId: string, message: Message }> = {};
      
      return (roomId: string, message: Message) => {
        // Store the latest update for this room
        pendingUpdates[roomId] = { roomId, message };
        
        // Clear existing timeout
        if (timeout) clearTimeout(timeout);
        
        // Set new timeout to process all pending updates
        timeout = setTimeout(() => {
          // Process all pending updates at once
          updateChatRooms((prev: ChatRoom[]) => {
            const updatedRooms = [...prev];
            const movedRooms: ChatRoom[] = [];
            
            // Apply all pending updates
            Object.values(pendingUpdates).forEach(({ roomId, message }) => {
              const roomIndex = updatedRooms.findIndex(room => room._id === roomId);
              if (roomIndex !== -1) {
                const room = updatedRooms[roomIndex];
                const updatedRoom = {
                  ...room,
                  lastMessage: message
                };
                
                // Remove from current position
                updatedRooms.splice(roomIndex, 1);
                // Add to moved rooms
                movedRooms.push(updatedRoom);
              }
            });
            
            // Reset pending updates
            pendingUpdates = {};
            
            // Return updated rooms with moved rooms at the top
            return [...movedRooms, ...updatedRooms];
          });
          
          // Update messages for the selected room if needed
          if (selectedRoom && pendingUpdates[selectedRoom._id]) {
            const { roomId, message } = pendingUpdates[selectedRoom._id];
            setMessages((prev: Record<string, Message[]>) => {
              const roomMessages = prev[roomId] || [];
              const messageExists = roomMessages.some((msg: Message) => msg._id === message._id);
              
              if (!messageExists) {
                return {
                  ...prev,
                  [roomId]: [...roomMessages, message]
                };
              }
              return prev;
            });
          }
          
          timeout = null;
        }, 100); // 100ms debounce time
      };
    })(),
    [updateChatRooms, setMessages, selectedRoom]
  );

  // Set up socket event listeners
  useEffect(() => {
    if (!socket || !userId) return;

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      // Update messages for the relevant chat room
      setMessages((prev: Record<string, Message[]>) => {
        const roomMessages = prev[message.chatRoomId] || [];
        return {
          ...prev,
          [message.chatRoomId]: [...roomMessages, message]
        };
      });
    };

    // Listen for last message updates - this is the critical part
    const handleLastMessageUpdated = ({ roomId, message }: { roomId: string, message: Message }) => {
      debouncedUpdateChatRooms(roomId, message);
    };

    // Listen for messages being read
    const handleMessagesRead = ({ messageIds, userId: readerId, readAt }: { 
      messageIds: string[], 
      userId: string, 
      readAt: string 
    }) => {
      if (readerId === userId) return;

      // Update read status for messages
      setMessages((prev: Record<string, Message[]>) => {
        const updatedMessages = { ...prev };
        
        Object.keys(updatedMessages).forEach(roomId => {
          updatedMessages[roomId] = updatedMessages[roomId].map((msg: Message) => {
            if (messageIds.includes(msg._id)) {
              // Check if this user has already read the message
              const hasRead = msg.readBy?.some((read: ReadReceipt) => 
                typeof read === 'object' && read.userId === readerId
              );
              
              if (!hasRead) {
                return {
                  ...msg,
                  readBy: [...(msg.readBy || []), { 
                    userId: readerId, 
                    readAt: new Date(readAt)
                  }]
                };
              }
            }
            return msg;
          });
        });
        
        return updatedMessages;
      });
      
      // IMPORTANT: Also update the chat rooms list to reflect read status changes
      updateChatRooms((prev: ChatRoom[]) => {
        return prev.map(room => {
          // Check if the last message of this room is in the messageIds
          if (room.lastMessage && messageIds.includes(room.lastMessage._id)) {
            // Check if the reader has already read this message
            const hasRead = room.lastMessage.readBy?.some(read => 
              typeof read === 'object' && read.userId === readerId
            );
            
            if (!hasRead) {
              // Update the lastMessage readBy array
              return {
                ...room,
                lastMessage: {
                  ...room.lastMessage,
                  readBy: [...(room.lastMessage.readBy || []), {
                    userId: readerId,
                    readAt: new Date(readAt)
                  }]
                }
              };
            }
          }
          return room;
        });
      });
    };

    // Listen for new chat rooms
    const handleNewChatRoom = async (room: ChatRoom) => {
      // If we have a fetchUserData function, fetch any missing user data
      if (fetchUserData && room.participants) {
        // Fetch user data for any participants we don't have yet
        for (const participantId of room.participants) {
          if (participantId !== userId) {
            await fetchUserData(participantId);
          }
        }
      }
      
      updateChatRooms((prev: ChatRoom[]) => [room, ...prev]);
    };

    // Listen for updated chat rooms
    const handleUpdateChatRoom = (updatedRoom: ChatRoom) => {
      updateChatRooms((prev: ChatRoom[]) => 
        prev.map(room => room._id === updatedRoom._id ? updatedRoom : room)
      );
    };

    // Listen for deleted chat rooms
    const handleChatRoomDeleted = ({ chatRoomId }: { chatRoomId: string }) => {
      updateChatRooms((prev: ChatRoom[]) => prev.filter(room => room._id !== chatRoomId));
      
      // If the deleted room is currently selected, navigate away
      if (selectedRoom?._id === chatRoomId) {
        router.push('/chat');
      }
    };

    // Register event listeners
    socket.on('new_message', handleNewMessage);
    socket.on('messages_read', handleMessagesRead);
    socket.on('new_chat_room', handleNewChatRoom);
    socket.on('update_chat_room', handleUpdateChatRoom);
    socket.on('chat_room_deleted', handleChatRoomDeleted);
    socket.on('last_message_updated', handleLastMessageUpdated);

    // Clean up listeners on unmount
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('messages_read', handleMessagesRead);
      socket.off('new_chat_room', handleNewChatRoom);
      socket.off('update_chat_room', handleUpdateChatRoom);
      socket.off('chat_room_deleted', handleChatRoomDeleted);
      socket.off('last_message_updated', handleLastMessageUpdated);
    };
  }, [socket, userId, selectedRoom, router, setMessages, setChatRooms, fetchUserData, debouncedUpdateChatRooms]);

  // Join the selected chat room's socket channel
  useEffect(() => {
    if (!socket || !selectedRoom) return;
    
    const roomId = String(selectedRoom._id);
    
    socket.emit('join_room', roomId);
    
    return () => {
      socket.emit('leave_room', roomId);
    };
  }, [socket, selectedRoom?._id]);

  // Add this at the end of the useEffect for socket events
  useEffect(() => {
    if (!socket || !userId) return;
    
    // Join all rooms that the user is part of
    const joinAllRooms = () => {
      console.log('Rejoining all chat rooms after connection');
      if (selectedRoom) {
        socket.emit('join_room', selectedRoom._id);
      }
    };
    
    // Listen for reconnection events
    socket.on('connect', joinAllRooms);
    
    return () => {
      socket.off('connect', joinAllRooms);
    };
  }, [socket, userId, selectedRoom]);
} 