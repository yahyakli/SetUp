"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Paperclip, Send, Smile, Image as ImageIcon, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useTheme } from 'next-themes';
import { CHAT_SERVICE_URL } from '@/constants/API_URLS';
import axios from 'axios';
import { ChatRoom } from '@/types';
import { RootState } from '@/lib/store';
import { useSelector } from 'react-redux';
import Image from 'next/image';

type AttachmentType = 'file' | 'image' | null;

interface FileAttachment {
  file: File;
  type: AttachmentType;
  preview?: string;
}

export default function ChatInput({ selectedRoom }: {
  selectedRoom: ChatRoom;
}) {
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
  const { resolvedTheme } = useTheme();

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [newMessage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSendMessage = async () => {
    // Don't allow sending if there's no message and no attachment
    if (!newMessage.trim() && !attachment) return;
    
    // Don't allow sending multiple messages at once
    if (isSending) return;
    
    setIsSending(true);
    
    try {
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
        
        const response = await axios.post(`${CHAT_SERVICE_URL}/api/messages`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response);
      } else {
        // Send text-only message
        await axios.post(
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
    } catch (error) {
      console.error('Error sending message:', error);
      // You could add error handling UI here
    } finally {
      setIsSending(false);
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

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check if the send button should be enabled
  const canSendMessage = (!!newMessage.trim() || !!attachment) && !isSending;

  return (
    <div className="p-4 border-t dark:border-gray-800 shrink-0 bg-white dark:bg-gray-800">
      {attachment && (
        <div className="mb-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
            onClick={handleRemoveAttachment}
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
      )}
      
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
            onChange={(e) => setNewMessage(e.target.value)}
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
              <EmojiPicker 
                onEmojiClick={handleEmojiClick}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                theme={resolvedTheme === 'dark' ? 'dark' : 'light' as any}
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
} 