import React, { useState } from 'react'
import { ChatRoom, User } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Plus, Users, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import NewChatDialog from './NewChatDialog'

interface ChatSidebarProps {
  chatRooms: ChatRoom[]
  selectedChatRoom: ChatRoom | null
  onSelectChatRoom: (chatRoom: ChatRoom) => void
  loading: boolean
}

export default function ChatSidebar({
  chatRooms,
  selectedChatRoom,
  onSelectChatRoom,
  loading
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)

  // Filter chat rooms based on search query
  const filteredChatRooms = chatRooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Render loading skeletons
  if (loading) {
    return (
      <div className="w-80 border-r dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b dark:border-gray-800">
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="p-4 space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 border-r dark:border-gray-800 flex flex-col">
      <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-bold">Messages</h2>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowNewChatDialog(true)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-4 border-b dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChatRooms.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              No conversations found
            </div>
          ) : (
            filteredChatRooms.map((room) => (
              <div
                key={room._id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors",
                  selectedChatRoom?._id === room._id && "bg-accent"
                )}
                onClick={() => onSelectChatRoom(room)}
              >
                <div className="flex-shrink-0">
                  {room.type === 'direct' ? (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-secondary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium truncate">{room.name}</h3>
                    {room.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(room.lastMessage.createdAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {room.lastMessage ? room.lastMessage.content : 'No messages yet'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <NewChatDialog 
        isOpen={showNewChatDialog} 
        onClose={() => setShowNewChatDialog(false)} 
      />
    </div>
  )
} 