import React from 'react'
import { Message, MessageAttachment } from '@/types'
import { format } from 'date-fns'
import { Paperclip, FileText, Image, Film, File } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: Message
  isCurrentUser: boolean
}

export default function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return format(new Date(date), 'h:mm a')
  }

  const getAttachmentIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    } else if (mimeType.startsWith('video/')) {
      return <Film className="h-4 w-4" />
    } else if (mimeType.includes('pdf')) {
      return <FileText className="h-4 w-4" />
    } else {
      return <File className="h-4 w-4" />
    }
  }

  return (
    <div className={cn(
      "flex items-end gap-2",
      isCurrentUser ? "justify-end" : "justify-start"
    )}>
      {!isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          {message.senderId.charAt(0).toUpperCase()}
        </div>
      )}
      
      <div className="space-y-1 max-w-[70%]">
        <div className={cn(
          "rounded-lg p-3",
          isCurrentUser 
            ? "bg-primary text-primary-foreground rounded-br-none" 
            : "bg-muted rounded-bl-none"
        )}>
          {message.content}
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => (
                <div 
                  key={attachment._id}
                  className="flex items-center gap-2 p-2 rounded bg-background/20"
                >
                  {getAttachmentIcon(attachment.mimeType)}
                  <div className="overflow-hidden text-sm">
                    <div className="truncate">{attachment.originalName}</div>
                    <div className="text-xs opacity-70">
                      {Math.round(attachment.size / 1024)} KB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className={cn(
          "text-xs text-muted-foreground",
          isCurrentUser ? "text-right" : "text-left"
        )}>
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  )
} 