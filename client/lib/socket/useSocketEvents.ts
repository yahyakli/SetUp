import { useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { Message, ChatRoom } from '@/types';
import { useRouter } from 'next/navigation';

export function useSocketEvents({
  userId,
  selectedRoom,
  setMessages,
  setChatRooms
}: {
  userId?: string;
  selectedRoom: ChatRoom | null;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
  setChatRooms: React.Dispatch<React.SetStateAction<ChatRoom[]>>;
}) {
  const { socket } = useSocket();
  const router = useRouter();

  // Set up socket event listeners
  useEffect(() => {
    if (!socket || !userId) return;

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
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
    };

    // Listen for messages being read
    const handleMessagesRead = ({ messageIds, userId: readerId, readAt }: { 
      messageIds: string[], 
      userId: string, 
      readAt: string 
    }) => {
      if (readerId === userId) return; // Skip if it's the current user

      // Update read status for messages
      setMessages(prev => {
        const updatedMessages = { ...prev };
        
        Object.keys(updatedMessages).forEach(roomId => {
          updatedMessages[roomId] = updatedMessages[roomId].map(msg => {
            if (messageIds.includes(msg._id)) {
              // Check if this user has already read the message
              const hasRead = msg.readBy?.some(read => read.userId === readerId);
              
              if (!hasRead) {
                return {
                  ...msg,
                  readBy: [...(msg.readBy || []), { userId: readerId, readAt }]
                };
              }
            }
            return msg;
          });
        });
        
        return updatedMessages;
      });
    };

    // Listen for new chat rooms
    const handleNewChatRoom = (room: ChatRoom) => {
      setChatRooms(prev => [room, ...prev]);
    };

    // Listen for updated chat rooms
    const handleUpdateChatRoom = (updatedRoom: ChatRoom) => {
      setChatRooms(prev => 
        prev.map(room => room._id === updatedRoom._id ? updatedRoom : room)
      );
    };

    // Listen for deleted chat rooms
    const handleChatRoomDeleted = ({ chatRoomId }: { chatRoomId: string }) => {
      setChatRooms(prev => prev.filter(room => room._id !== chatRoomId));
      
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

    // Clean up listeners on unmount
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('messages_read', handleMessagesRead);
      socket.off('new_chat_room', handleNewChatRoom);
      socket.off('update_chat_room', handleUpdateChatRoom);
      socket.off('chat_room_deleted', handleChatRoomDeleted);
    };
  }, [socket, userId, selectedRoom, router, setMessages, setChatRooms]);

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
} 