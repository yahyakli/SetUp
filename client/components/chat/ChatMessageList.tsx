"use client";

import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { Message, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { CHAT_SERVICE_URL, USERS_SERVICE_URL } from '@/constants/API_URLS';
import MessageAttachment from './MessageAttachment';
import TypingIndicator from './TypingIndicator';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { debounce } from 'lodash';
import { useAppContext } from '@/context/AppContext';

interface ChatMessageListProps {
  messages: Message[];
  currentUserId?: string;
  users: Record<string, User>;
  showUserInfo?: boolean;
  roomId: string;
  onLoadMoreMessages?: (lastMessageId: string) => void;
  hasMoreMessages?: boolean;
}

export default function ChatMessageList({ 
  messages, 
  currentUserId, 
  users, 
  showUserInfo = false,
  roomId,
  onLoadMoreMessages,
  hasMoreMessages = false
}: ChatMessageListProps) {
  const { token } = useSelector((state: RootState) => state.user);
  const { markLastMessageAsRead, updateLastMessage, lastMessages } = useAppContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const typingIndicatorRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [previousMessagesLength, setPreviousMessagesLength] = useState(0);
  const [previousScrollHeight, setPreviousScrollHeight] = useState(0);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [firstVisibleMessageId, setFirstVisibleMessageId] = useState<string | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Modify the useEffect for socket events to update the messages array correctly
  useEffect(() => {
    // Only auto-scroll on initial load or when we explicitly want to scroll to bottom
    if ((isInitialLoad || shouldScrollToBottom) && messagesEndRef.current && scrollContainerRef.current) {
      // Use scrollIntoView with a slight delay to ensure proper rendering
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
        // After initial load, set flag to false
        if (isInitialLoad) setIsInitialLoad(false);
      }, 100);
    }
    
    // When new messages arrive (messages length increases), check if we should auto-scroll
    if (messages.length > previousMessagesLength && !isLoadingMore) {
      // If the last message is from the current user, always scroll to bottom
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.senderId === currentUserId) {
        setShouldScrollToBottom(true);
      }
      
      setPreviousMessagesLength(messages.length);
    }
  }, [messages, shouldScrollToBottom, isInitialLoad, isLoadingMore, previousMessagesLength, currentUserId]);
  
  // Handle scroll to load more messages with improved position tracking
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    
    if (!scrollContainer) return;
    
    const handleScroll = () => {
      // If we're near the top (within 50px) and there are more messages to load
      if (scrollContainer.scrollTop < 50 && hasMoreMessages && !isLoadingMore && messages.length > 0) {
        setIsLoadingMore(true);
        
        // Find the first visible message to use as an anchor
        if (messages && messages.length > 0) {
          // Get all message elements
          const messageElements = Array.from(scrollContainer.querySelectorAll('[data-message-id]'));
          
          // Find the first visible message
          for (const element of messageElements) {
            const rect = element.getBoundingClientRect();
            const containerRect = scrollContainer.getBoundingClientRect();
            
            // If the element is visible in the viewport
            if (rect.top >= containerRect.top && rect.bottom <= containerRect.bottom) {
              const messageId = element.getAttribute('data-message-id');
              if (messageId) {
                setFirstVisibleMessageId(messageId);
                break;
              }
            }
          }
        }
        
        // Store current scroll position and message count before loading more
        setPreviousScrollHeight(scrollContainer.scrollHeight);
        setPreviousMessagesLength(messages.length);
        
        // Get the oldest message ID
        const oldestMessage = [...messages].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )[0];
        
        if (oldestMessage && onLoadMoreMessages) {
          // Explicitly set shouldScrollToBottom to false when loading more
          setShouldScrollToBottom(false);
          onLoadMoreMessages(oldestMessage._id);
        }
      }
    };
    
    scrollContainer.addEventListener('scroll', handleScroll);
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [messages, hasMoreMessages, isLoadingMore, onLoadMoreMessages]);
  
  // Maintain scroll position when new messages are loaded at the top
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    
    if (!scrollContainer || !isLoadingMore) return;
    
    // If we've loaded more messages (messages length increased and we were loading more)
    if (messages.length > previousMessagesLength && previousScrollHeight > 0) {
      // If we have a reference message ID, scroll to it
      if (firstVisibleMessageId) {
        // Find the message element by ID
        const messageElement = scrollContainer.querySelector(`[data-message-id="${firstVisibleMessageId}"]`);
        
        if (messageElement) {
          // Scroll to the element with a slight delay to ensure DOM has updated
          setTimeout(() => {
            messageElement.scrollIntoView({ block: 'start', behavior: 'auto' });
            
            // Reset loading state but keep shouldScrollToBottom false
            setIsLoadingMore(false);
            setPreviousScrollHeight(0);
            setFirstVisibleMessageId(null);
          }, 50);
        } else {
          // Fallback to the old method if we can't find the element
          const newScrollHeight = scrollContainer.scrollHeight;
          const scrollHeightDifference = newScrollHeight - previousScrollHeight;
          
          if (scrollHeightDifference > 0) {
            setTimeout(() => {
              if (scrollContainer) {
                scrollContainer.scrollTop = scrollHeightDifference;
              }
              
              // Reset states
              setIsLoadingMore(false);
              setPreviousScrollHeight(0);
              setFirstVisibleMessageId(null);
            }, 50);
          }
        }
      } else {
        // Fallback to the old method if we don't have a reference message
        const newScrollHeight = scrollContainer.scrollHeight;
        const scrollHeightDifference = newScrollHeight - previousScrollHeight;
        
        if (scrollHeightDifference > 0) {
          setTimeout(() => {
            if (scrollContainer) {
              scrollContainer.scrollTop = scrollHeightDifference;
            }
            
            // Reset states
            setIsLoadingMore(false);
            setPreviousScrollHeight(0);
          }, 50);
        }
      }
    }
  }, [messages, isLoadingMore, previousMessagesLength, previousScrollHeight, firstVisibleMessageId]);
  
  // Handle user manually scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    
    const handleUserScroll = () => {
      // If user scrolls up more than 100px from bottom, disable auto-scrolling
      const isNearBottom = 
        scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 100;
      
      if (!isNearBottom && shouldScrollToBottom) {
        setShouldScrollToBottom(false);
      } else if (isNearBottom && !shouldScrollToBottom && !isLoadingMore) {
        setShouldScrollToBottom(true);
      }
    };
    
    scrollContainer.addEventListener('scroll', handleUserScroll);
    return () => scrollContainer.removeEventListener('scroll', handleUserScroll);
  }, [shouldScrollToBottom, isLoadingMore]);
  
  // Format time for display
  const formatMessageTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  // Get user name from ID
  const getUserName = (userId: string) => {
    const user = users[userId];
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  // Get user avatar from ID
  const getUserAvatar = (userId: string) => {
    const user = users[userId];
    return user?.avatar || '';
  };

  // Get user initials from ID
  const getUserInitials = (userId: string) => {
    const user = users[userId];
    return user ? `${user.firstName[0]}${user.lastName[0]}` : 'UN';
  };

  // Function to group messages by date - define this first
  const groupMessagesByDate = useCallback((messagesArray: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    
    // Ensure messages is a valid array
    const messageArray = Array.isArray(messagesArray) ? messagesArray : [];
    
    // First sort all messages by creation date
    const sortedMessages = [...messageArray].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    sortedMessages.forEach(message => {
      const messageDate = new Date(message.createdAt);
      const dateStr = format(messageDate, 'MMMM d, yyyy');
      
      const existingGroup = groups.find(group => group.date === dateStr);
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date: dateStr, messages: [message] });
      }
    });
    
    // Sort groups by date (oldest first)
    groups.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });
    
    return groups;
  }, []);

  // Now use the function in useMemo
  const messageGroups = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages, groupMessagesByDate]);

  // Update the last message in context when messages change
  useEffect(() => {
    if (messages.length > 0 && roomId) {
      // Find the most recent message
      const sortedMessages = [...messages].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Only update if the last message is different from what's already in context
      const lastMessage = sortedMessages[0];
      const currentLastMessage = lastMessages[roomId];
      
      if (!currentLastMessage || currentLastMessage._id !== lastMessage._id) {
        updateLastMessage(roomId, lastMessage);
      }
    }
  }, [messages, roomId, updateLastMessage, lastMessages]);

  // Modify the useEffect for marking messages as read
  useEffect(() => {
    if (!currentUserId || !roomId || !token) return;
    
    // Create a map to track which messages have been marked as read
    const readMessageMap = new Map<string, boolean>();
    const messageIdsToMark: string[] = [];
    
    // Function to mark messages as read
    const markMessagesAsRead = async () => {
      if (messageIdsToMark.length === 0) return;
      
      const messageIdsToSend = [...messageIdsToMark];
      messageIdsToMark.length = 0; // Clear the array
      
      try {
        await axios.put(`${CHAT_SERVICE_URL}/api/messages/read/${currentUserId}`, {
          messageIds: messageIdsToSend,
          chatRoomId: roomId
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Add to read map to prevent duplicate requests
        messageIdsToSend.forEach(id => {
          readMessageMap.set(id, true);
          // Also update the last message read status in context
          markLastMessageAsRead(roomId, id);
        });
        
        console.log('Marked messages as read:', messageIdsToSend);
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }
    };
    
    // Debounced version of markMessagesAsRead to avoid too many requests
    const debouncedMarkAsRead = debounce(markMessagesAsRead, 500);
    
    // Set up intersection observer to detect when messages are visible
    const observer = new IntersectionObserver((entries) => {
      let shouldMarkAsRead = false;
      
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const messageId = entry.target.getAttribute('data-message-id');
          if (messageId) {
            const message = messages.find(m => m._id === messageId);
            
            // Skip if already marked as read or is the user's own message
            if (!message) return;
            if (message.senderId === currentUserId) return; // Don't mark your own messages
            
            // Check if message is already read by current user
            const isAlreadyRead = Array.isArray(message.readBy) && 
              message.readBy.some(readBy => 
                typeof readBy === 'object' && 
                readBy.userId === currentUserId
              );
            
            if (isAlreadyRead) return;
            if (readMessageMap.get(messageId)) return;
            
            // Add to list of messages to mark as read
            messageIdsToMark.push(messageId);
            shouldMarkAsRead = true;
          }
        }
      });
      
      if (shouldMarkAsRead) {
        debouncedMarkAsRead();
      }
    }, {
      root: scrollContainerRef.current,
      threshold: 0.5 // Message is considered visible when 50% is in view
    });
    
    // Observe all message elements
    Object.values(messageRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });
    
    return () => {
      // Clean up observer and cancel any pending debounced calls
      observer.disconnect();
      debouncedMarkAsRead.cancel();
    };
  }, [messages, currentUserId, roomId, token, markLastMessageAsRead]);

  // Also update the effect for marking the last message as read when entering a chat room
  useEffect(() => {
    if (!currentUserId || !roomId || !token || !messages.length) return;
    
    // Find the last message in the room
    const lastMessage = messages[messages.length - 1];
    
    // Check if the last message is not from the current user and is unread
    if (lastMessage && 
        lastMessage.senderId !== currentUserId && 
        !lastMessage.readBy?.some(read => 
          typeof read === 'object' && read.userId === currentUserId
        )) {
      
      console.log('Marking last message as read on room entry:', lastMessage._id);
      
      // Mark the last message as read
      axios.put(`${CHAT_SERVICE_URL}/api/messages/read/${currentUserId}`, {
        messageIds: [lastMessage._id],
        chatRoomId: roomId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(() => {
        console.log('Successfully marked last message as read on room entry');
        // Update the last message read status in context
        markLastMessageAsRead(roomId, lastMessage._id);
      }).catch(error => {
        console.error('Failed to mark last message as read on room entry:', error);
      });
    }
  }, [roomId, currentUserId, token, messages, markLastMessageAsRead]);

  // Check if there are no messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="mb-4 text-gray-400 dark:text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No messages yet</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Start the conversation by sending a message below.
          </p>
        </div>
      </div>
    );
  }

  const renderMessage = (message: Message, messageIndex: number, group: { date: string; messages: Message[] }) => {
    const isCurrentUser = message.senderId === currentUserId;
    const showAvatar = showUserInfo && messageIndex === 0 || 
      (showUserInfo && group.messages[messageIndex - 1].senderId !== message.senderId);
    
    // Get users who have read this message (excluding the sender)
    const readByUsers = message.readBy 
      ? message.readBy
          .filter(readBy => readBy.userId !== message.senderId) // Don't show sender in read receipts
          .map(readBy => {
            const user = users[readBy.userId];
            return user ? { ...user, readAt: readBy.readAt } : null;
          })
          .filter(Boolean) // Filter out undefined users
      : [];
    
    return (
      <div 
        key={message._id} 
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
        data-message-id={message._id}
        ref={el => {
          messageRefs.current[message._id] = el;
        }}
      >
        <div className={`flex items-center gap-2 max-w-[80%] ${
          !isCurrentUser && !showAvatar && showUserInfo ? 'pl-10' : ''
        }`}>
          {!isCurrentUser && showAvatar && showUserInfo ? (
            <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
              <AvatarImage src={USERS_SERVICE_URL + getUserAvatar(message.senderId)} />
              <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white">
                {getUserInitials(message.senderId)}
              </AvatarFallback>
            </Avatar>
          ) : !isCurrentUser && showUserInfo ? (
            <div className="w-10 h-10 flex-shrink-0"></div>
          ) : null}
          
          <div>
            {!isCurrentUser && showAvatar && showUserInfo && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                {getUserName(message.senderId)}
              </p>
            )}
            
            <div className={`rounded-2xl p-3 ${
              isCurrentUser 
                ? 'bg-blue-500 text-white rounded-tr-none' 
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none shadow-sm'
            }`}>
              <p>{message.content}</p>
              
              {/* Render attachments if they exist */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="message-attachments">
                  {message.attachments.map(attachment => (
                    <MessageAttachment 
                      key={attachment._id} 
                      attachment={attachment} 
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center mt-1 justify-end">
              {/* Read receipts - show avatars of users who read the message */}
              {isCurrentUser && readByUsers.length > 0 && (
                <div className="flex -space-x-1 mr-2" title="Read by">
                  {readByUsers.slice(0, 3).map(user => (
                    <Avatar 
                      key={user?.id} 
                      className="h-4 w-4 border border-white dark:border-gray-800"
                      title={`${user?.firstName} ${user?.lastName} • ${format(new Date(user?.readAt || ''), 'h:mm a')}`}
                    >
                      <AvatarImage src={(USERS_SERVICE_URL || '') + user?.avatar} />
                      <AvatarFallback className="text-[8px]">
                        {user?.firstName[0]}{user?.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {readByUsers.length > 3 && (
                    <span className="text-xs text-gray-500 ml-1">+{readByUsers.length - 3}</span>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatMessageTime(message.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col-reverse h-full overflow-y-auto p-4 space-y-reverse space-y-4">
      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900" ref={scrollContainerRef}>
        <div className="p-4 space-y-8">
          {hasMoreMessages && (
            <div className="flex justify-center py-2">
              {isLoadingMore ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading more messages...
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Scroll to top to load more messages
                </div>
              )}
            </div>
          )}
          
          {messageGroups.map((group) => (
            <div key={group.date} className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                  {group.date}
                </div>
              </div>
              
              {group.messages.map((message, messageIndex) => {
                return renderMessage(message, messageIndex, group);
              })}
            </div>
          ))}
          
          {/* Add the typing indicator here with ref */}
          <div ref={typingIndicatorRef}>
            <TypingIndicator roomId={roomId} currentUserId={currentUserId} users={users} />
          </div>
          
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
} 