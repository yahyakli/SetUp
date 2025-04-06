"use client";

import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { Message, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { USERS_SERVICE_URL } from '@/constants/API_URLS';
import MessageAttachment from './MessageAttachment';
import TypingIndicator from './TypingIndicator';

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
  

  // Only scroll to bottom on initial load or when new messages arrive
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
  }, [messages, shouldScrollToBottom, isInitialLoad]);
  
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
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatMessageTime(message.createdAt)}
            </p>
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