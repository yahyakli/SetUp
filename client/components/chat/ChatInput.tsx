"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Paperclip, Send, Smile, Mic, Image } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="p-4 border-t dark:border-gray-800 shrink-0 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <Image className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <Mic className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative flex-1">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="pr-10 py-6 rounded-full bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus-visible:ring-blue-500"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Smile className="h-5 w-5" />
          </Button>
        </div>
        
        <Button 
          onClick={handleSendMessage} 
          disabled={!newMessage.trim()}
          size="icon"
          className="rounded-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
} 