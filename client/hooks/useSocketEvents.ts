import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
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
  setChatRooms: ((updatedRooms: React.SetStateAction<ChatRoom[]>) => void);
}) {
  const { socket } = useSocket();
  const router = useRouter();

  // Modify the helper function
  const updateChatRooms = (updater: (prev: ChatRoom[]) => ChatRoom[]) => {
    // Just pass the updater function directly to setChatRooms
    setChatRooms(updater as React.SetStateAction<ChatRoom[]>);
  };

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
          [message.chatRoomId]: [...roomMessages, message]
        };
      });
    };

    // NEW: Listen for last message updates
    const handleLastMessageUpdated = ({ roomId, message }: { roomId: string, message: Message }) => {
      // Keep this one for debugging the specific feature
      console.log('🔄 Last message updated event received:', { roomId, message });
      
      updateChatRooms((prev: ChatRoom[]) => {
        const roomIndex = prev.findIndex(room => room._id === roomId);
        
        if (roomIndex === -1) {
          console.warn('Could not find room with ID:', roomId);
          return prev;
        }
        
        const updatedRooms = [...prev];
        updatedRooms[roomIndex] = {
          ...updatedRooms[roomIndex],
          lastMessage: message
        };
        
        const [updatedRoom] = updatedRooms.splice(roomIndex, 1);
        const result = [updatedRoom, ...updatedRooms];
        return result;
      });
    };

    // Listen for messages being read
    const handleMessagesRead = ({ messageIds, userId: readerId, readAt }: { 
      messageIds: string[], 
      userId: string, 
      readAt: string 
    }) => {
      if (readerId === userId) return;

      // Update read status for messages
      setMessages(prev => {
        const updatedMessages = { ...prev };
        
        Object.keys(updatedMessages).forEach(roomId => {
          updatedMessages[roomId] = updatedMessages[roomId].map(msg => {
            if (messageIds.includes(msg._id)) {
              // Check if this user has already read the message
              const hasRead = msg.readBy?.some(read => 
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
    const handleNewChatRoom = (room: ChatRoom) => {
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
    socket.on('last_message_updated', handleLastMessageUpdated); // NEW

    // Clean up listeners on unmount
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('messages_read', handleMessagesRead);
      socket.off('new_chat_room', handleNewChatRoom);
      socket.off('update_chat_room', handleUpdateChatRoom);
      socket.off('chat_room_deleted', handleChatRoomDeleted);
      socket.off('last_message_updated', handleLastMessageUpdated); // NEW
    };
  }, [socket, userId, selectedRoom, router, setMessages, setChatRooms]);

  // Join the selected chat room's socket channel
  useEffect(() => {
    if (!socket || !selectedRoom) return;
    
    const roomId = String(selectedRoom._id);
    
    socket.emit('join_room', roomId);
    
    return () => {
      socket.emit('leave_room', roomId);
    };
  }, [socket, selectedRoom?._id]);
} 