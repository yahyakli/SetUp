"use client"
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import AppLayout from '../AppLayout'
import ChatSidebar from '@/components/chat/ChatSidebar'
import ChatWindow from '@/components/chat/ChatWindow'
import { ChatRoom } from '@/types'
import { generateFakeChatRooms } from '@/lib/fakeChatData'

export default function ChatPage() {
  const { user } = useSelector((state: RootState) => state.user)
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch chat rooms
    const fetchChatRooms = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call
        const fakeChatRooms = generateFakeChatRooms(user?.id || '')
        setChatRooms(fakeChatRooms)
        
        // Select the first chat room by default
        if (fakeChatRooms.length > 0 && !selectedChatRoom) {
          setSelectedChatRoom(fakeChatRooms[0])
        }
      } catch (error) {
        console.error('Error fetching chat rooms:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchChatRooms()
    }
  }, [user])

  const handleSelectChatRoom = (chatRoom: ChatRoom) => {
    setSelectedChatRoom(chatRoom)
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <ChatSidebar 
          chatRooms={chatRooms}
          selectedChatRoom={selectedChatRoom}
          onSelectChatRoom={handleSelectChatRoom}
          loading={loading}
        />
        <ChatWindow 
          chatRoom={selectedChatRoom}
          currentUser={user}
        />
      </div>
    </AppLayout>
  )
} 