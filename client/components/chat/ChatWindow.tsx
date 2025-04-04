import React, { useState, useRef, useEffect } from 'react'
import { ChatRoom, Message, User } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Paperclip, Send, Info, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import { generateFakeMessages } from '@/lib/fakeChatData'
import ChatMessage from './ChatMessage'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ChatWindowProps {
  chatRoom: ChatRoom | null
  currentUser: User | null
}

export default function ChatWindow({ chatRoom, currentUser }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRoom) {
      setLoading(true)
      // Simulate API call to fetch messages
      setTimeout(() => {
        const fakeMessages = generateFakeMessages(chatRoom._id, currentUser?.id || '')
        setMessages(fakeMessages)
        setLoading(false)
      }, 500)
    } else {
      setMessages([])
    }
  }, [chatRoom, currentUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !chatRoom || !currentUser) return

    const newMsg: Message = {
      _id: Date.now().toString(),
      chatRoomId: chatRoom._id,
      senderId: currentUser.id,
      content: newMessage,
      contentType: 'text',
      readBy: [{ userId: currentUser.id, readAt: new Date() }],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setMessages([...messages, newMsg])
    setNewMessage('')
  }

  if (!chatRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <div className="text-center space-y-2">
          <Info className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-medium">Select a conversation</h3>
          <p className="text-muted-foreground">Choose a conversation from the sidebar to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat header */}
      <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{chatRoom.name}</h2>
          <p className="text-sm text-muted-foreground">
            {chatRoom.type === 'project' 
              ? `Project chat • ${chatRoom.participants.length} members` 
              : 'Direct message'}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View info</DropdownMenuItem>
            <DropdownMenuItem>Add members</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Leave chat</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className={`flex items-start gap-3 ${i % 2 === 0 ? 'justify-end' : ''}`}>
                <div className={`max-w-[70%] ${i % 2 === 0 ? 'bg-primary/10' : 'bg-muted'} rounded-lg p-3 animate-pulse h-16`}></div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground">Start the conversation by sending a message</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage 
                key={message._id} 
                message={message} 
                isCurrentUser={message.senderId === currentUser?.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message input */}
      <div className="p-4 border-t dark:border-gray-800">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="flex-shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            className="flex-shrink-0"
            disabled={!newMessage.trim()}
          >
            <Send className="h-5 w-5 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  )
} 