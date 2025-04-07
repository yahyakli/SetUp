"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Paperclip, Send, Smile, Image as ImageIcon, X } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { useTheme } from 'next-themes';
import { CHAT_SERVICE_URL } from '@/constants/API_URLS';
import axios, { AxiosError } from 'axios';
import { ChatRoom } from '@/types';
import { RootState } from '@/lib/store';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'sonner';
import { debounce } from 'lodash';

type AttachmentType = 'file' | 'image' | null;

interface FileAttachment {
  file: File;
  type: AttachmentType;
  preview?: string;
}

// Memoize the emoji picker component to prevent re-renders
const MemoizedEmojiPicker = memo(({ onEmojiClick, theme }: { 
  onEmojiClick: (emojiObject: { emoji: string }) => void, 
  theme: Theme
}) => {
  return (
    <EmojiPicker 
      onEmojiClick={onEmojiClick}
      theme={theme}
    />
  );
});

MemoizedEmojiPicker.displayName = 'MemoizedEmojiPicker';

// Memoize the attachment preview component
const AttachmentPreview = memo(({ 
  attachment, 
  onRemove, 
  formatFileSize 
}: { 
  attachment: FileAttachment | null,
  onRemove: () => void,
  formatFileSize: (bytes: number) => string
}) => {
  if (!attachment) return null;
  
  return (
    <div className="mb-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
      
      {attachment.type === 'image' && attachment.preview && (
        <div className="flex items-center">
          <div className="relative w-20 h-20 rounded-md overflow-hidden mr-3">
            <Image
              src={attachment.preview} 
              alt="Selected image" 
              className="w-full h-full object-cover"
              width={80}
              height={80}
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{attachment.file.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(attachment.file.size)}
            </p>
          </div>
        </div>
      )}
      
      {attachment.type === 'file' && (
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
            <Paperclip className="h-5 w-5 text-blue-500 dark:text-blue-300" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{attachment.file.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(attachment.file.size)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

AttachmentPreview.displayName = 'AttachmentPreview';

// Wrap the main component with React.memo
const ChatInput = memo(({ selectedRoom }: {
  selectedRoom: ChatRoom;
}) => {
  const { user, token } = useSelector((state: RootState) => state.user);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { resolvedTheme } = useTheme();
  const { sendTypingStatus, joinRoom, socket } = useSocket();
  
  // Track if user is currently marked as typing
  const isTypingRef = useRef(false);

  // Join the chat room when component mounts or room changes
  useEffect(() => {
    if (selectedRoom?._id) {
      joinRoom(selectedRoom._id);
    }
    
    // Clean up typing indicator when component unmounts or room changes
    return () => {
      if (isTypingRef.current) {
        sendTypingStatus(selectedRoom._id, false);
      }
    };
  }, [selectedRoom?._id, joinRoom, sendTypingStatus]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [newMessage]);

  // Improve the typing indicator logic
  useEffect(() => {
    // Debounce typing indicator to prevent rapid state changes
    const handleTypingStatus = debounce(() => {
      if (newMessage.trim().length > 0) {
        // Start typing if not already typing
        if (!isTypingRef.current) {
          console.log('Starting typing');
          isTypingRef.current = true;
          sendTypingStatus(selectedRoom._id, true);
        }
        
        // Set timeout to stop typing after inactivity
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          if (isTypingRef.current) {
            console.log('Stopping typing due to inactivity');
            isTypingRef.current = false;
            sendTypingStatus(selectedRoom._id, false);
          }
        }, 3000);
      } else {
        // If message is empty, stop typing immediately
        if (isTypingRef.current) {
          console.log('Stopping typing due to empty message');
          isTypingRef.current = false;
          sendTypingStatus(selectedRoom._id, false);
        }
      }
    }, 300); // Debounce for 300ms
    
    handleTypingStatus();
    
    // Cleanup on unmount
    return () => {
      handleTypingStatus.cancel();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [newMessage, selectedRoom._id, sendTypingStatus]);

  // Handle text input changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Reset the typing timeout on each keystroke
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set a new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        console.log('Stopping typing due to inactivity');
        isTypingRef.current = false;
        sendTypingStatus(selectedRoom._id, false);
      }
    }, 3000);
  };

  // Handle blur event on textarea
  const handleBlur = () => {
    // When user clicks away from the textarea, stop typing
    if (isTypingRef.current) {
      console.log('Stopping typing due to blur');
      isTypingRef.current = false;
      sendTypingStatus(selectedRoom._id, false);
    }
  };

  const handleSendMessage = async () => {
    // Don't allow sending if there's no message and no attachment
    if (!newMessage.trim() && !attachment) return;
    
    // Don't allow sending multiple messages at once
    if (isSending) return;
    
    setIsSending(true);
    
    // Clear typing indicator when sending message
    if (isTypingRef.current) {
      console.log('Stopping typing due to sending message');
      isTypingRef.current = false;
      sendTypingStatus(selectedRoom._id, false);
    }
    
    try {
      let response;
      
      if (attachment) {
        // Send message with attachment
        const formData = new FormData();
        formData.append('chatRoomId', selectedRoom._id);
        formData.append('contentType', 'file');
        formData.append('user_id', user?.id || '');
        formData.append('file', attachment.file);
        
        // If there's also text content, include it
        if (newMessage.trim()) {
          formData.append('content', newMessage);
        }
        
        try {
          response = await axios.post(`${CHAT_SERVICE_URL}/api/messages`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(response);
        } catch(error) {
          if(error instanceof AxiosError) {  
            toast.error(error.response?.data.message);
          }
          console.error('Error sending message:', error);
          throw error;
        }
      } else {
        // Send text-only message
        response = await axios.post(
          `${CHAT_SERVICE_URL}/api/messages`,
          {
            chatRoomId: selectedRoom._id,
            content: newMessage,
            contentType: 'text',
            user_id: user?.id
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
      }
      
      // Reset state
      setNewMessage('');
      setAttachment(null);
      
      // Only emit update_last_message, let the server handle broadcasting
      if (socket && response?.data) {
        console.log('🔄 Emitting update_last_message with:', {
          roomId: selectedRoom._id,
          message: response.data
        });
        
        socket.emit('update_last_message', {
          roomId: selectedRoom._id,
          message: response.data
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // You could add error handling UI here
    } finally {
      setIsSending(false);
      
      // Focus the textarea after sending the message
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleFileClick = () => {
    if (attachment) return;
    fileInputRef.current?.click();
  };

  const handleImageClick = () => {
    if (attachment) return;
    imageInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check if the file is an image
    const isImage = file.type.startsWith('image/');
    
    // Create a preview URL for images
    const preview = isImage ? URL.createObjectURL(file) : undefined;
    
    setAttachment({
      file,
      type: isImage ? 'image' : 'file',
      preview
    });
    
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const preview = URL.createObjectURL(file);
    
    setAttachment({
      file,
      type: 'image',
      preview
    });
    
    // Reset the input value so the same image can be selected again
    e.target.value = '';
  };

  const handleRemoveAttachment = () => {
    if (attachment?.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
    setAttachment(null);
  };

  const handleEmojiClick = (emojiObject: { emoji: string }) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Format file size - memoize this function
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Check if the send button should be enabled
  const canSendMessage = (!!newMessage.trim() || !!attachment) && !isSending;

  // Focus textarea when component mounts or room changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [selectedRoom._id]);

  return (
    <div className="p-4 border-t dark:border-gray-800 shrink-0 bg-white dark:bg-gray-800">
      <AttachmentPreview 
        attachment={attachment} 
        onRemove={handleRemoveAttachment}
        formatFileSize={formatFileSize}
      />
      
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full ${
              attachment || isSending
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={handleFileClick}
            disabled={!!attachment || isSending}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            disabled={isSending}
          />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full ${
              attachment || isSending
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={handleImageClick}
            disabled={!!attachment || isSending}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <input 
            type="file" 
            ref={imageInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageChange}
            disabled={isSending}
          />
        </div>
        
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            placeholder={"Type a message..."}
            value={newMessage}
            onChange={handleTextChange}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && canSendMessage) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="pr-10 py-3 min-h-[44px] max-h-[150px] resize-none rounded-2xl bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus-visible:ring-blue-500"
            rows={1}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            disabled={isSending}
          />
          <Button 
            ref={emojiButtonRef}
            variant="ghost" 
            size="icon" 
            className="absolute right-2 bottom-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isSending}
          >
            <Smile className="h-5 w-5" />
          </Button>
          
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2 z-10">
              <MemoizedEmojiPicker 
                onEmojiClick={handleEmojiClick}
                theme={resolvedTheme === 'dark' ? 'dark' as Theme : 'light' as Theme}
              />
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleSendMessage} 
          disabled={!canSendMessage}
          className={`rounded-full ${
            canSendMessage 
              ? 'bg-blue-500 hover:bg-blue-600' 
              : 'bg-blue-300 dark:bg-blue-700'
          } text-white w-12 h-12`}
        >
          <Send className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput; 