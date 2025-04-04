import { ChatRoom, Message, MessageAttachment } from '@/types'
import { faker } from '@faker-js/faker'

// Generate fake chat rooms
export function generateFakeChatRooms(currentUserId: string, count = 5): ChatRoom[] {
  const chatRooms: ChatRoom[] = []
  
  // Generate direct chats (2/3 of total count)
  const directChatCount = Math.floor(count * 2/3)
  for (let i = 0; i < directChatCount; i++) {
    const otherUserId = `user${i + 1}`
    const otherUserName = faker.person.fullName()
    
    // Randomly decide if this chat has a last message
    const hasLastMessage = Math.random() > 0.2
    
    let lastMessage = undefined
    if (hasLastMessage) {
      lastMessage = {
        _id: faker.string.uuid(),
        chatRoomId: `chat${i}`,
        senderId: Math.random() > 0.5 ? currentUserId : otherUserId,
        content: faker.lorem.sentence(),
        contentType: 'text' as const,
        readBy: [{ userId: currentUserId, readAt: faker.date.recent() }],
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent()
      }
    }
    
    chatRooms.push({
      _id: `chat${i}`,
      name: otherUserName,
      type: 'direct',
      participants: [currentUserId, otherUserId],
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      lastMessage
    })
  }
  
  // Generate project chats (1/3 of total count)
  const projectChatCount = count - directChatCount
  for (let i = 0; i < projectChatCount; i++) {
    const projectId = i + 1
    const projectName = faker.company.name() + ' Project'
    
    const participants = [currentUserId]
    // Add 2-5 random participants
    const participantCount = Math.floor(Math.random() * 4) + 2
    for (let j = 0; j < participantCount; j++) {
      participants.push(`user${j + 10}`)
    }
    
    // Randomly decide if this chat has a last message
    const hasLastMessage = Math.random() > 0.1
    
    let lastMessage = undefined
    if (hasLastMessage) {
      lastMessage = {
        _id: faker.string.uuid(),
        chatRoomId: `project${i}`,
        senderId: participants[Math.floor(Math.random() * participants.length)],
        content: faker.lorem.sentence(),
        contentType: 'text' as const,
        readBy: [{ userId: currentUserId, readAt: faker.date.recent() }],
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent()
      }
    }
    
    chatRooms.push({
      _id: `project${i}`,
      name: projectName,
      type: 'project',
      projectId,
      participants,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      lastMessage
    })
  }
  
  // Sort by most recent message
  return chatRooms.sort((a, b) => {
    // If neither has a last message, sort by creation date
    if (!a.lastMessage && !b.lastMessage) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    // If only one has a last message, that one comes first
    if (!a.lastMessage) return 1
    if (!b.lastMessage) return -1
    // Otherwise sort by last message date
    return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  })
}

// Generate fake messages for a chat room
export function generateFakeMessages(chatRoomId: string, currentUserId: string): Message[] {
  const messages: Message[] = []
  const otherUserIds = [`user${Math.floor(Math.random() * 5) + 1}`, `user${Math.floor(Math.random() * 5) + 6}`]
  
  // Generate between 15-30 messages for better testing
  const messageCount = Math.floor(Math.random() * 15) + 15
  
  // Create a date range for the messages (last 7 days)
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 7)
  
  for (let i = 0; i < messageCount; i++) {
    // Determine sender (more likely to be the current user)
    const isCurrentUser = Math.random() > 0.4
    const senderId = isCurrentUser ? currentUserId : otherUserIds[Math.floor(Math.random() * otherUserIds.length)]
    
    // Create a timestamp within the date range
    const messageDate = faker.date.between({ from: startDate, to: endDate })
    
    // Create message content with varying length
    const contentLength = Math.random() > 0.7 ? 
      (Math.random() > 0.3 ? 'long' : 'very-long') : 'normal'
    
    let content = ''
    switch (contentLength) {
      case 'normal':
        content = faker.lorem.sentence()
        break
      case 'long':
        content = faker.lorem.sentences(2)
        break
      case 'very-long':
        content = faker.lorem.paragraph()
        break
    }
    
    // Occasionally add attachments
    const attachments: MessageAttachment[] = []
    if (Math.random() > 0.8) {
      const attachmentCount = Math.floor(Math.random() * 2) + 1
      
      for (let j = 0; j < attachmentCount; j++) {
        const fileTypes = [
          { mime: 'application/pdf', ext: 'pdf' },
          { mime: 'image/jpeg', ext: 'jpg' },
          { mime: 'image/png', ext: 'png' },
          { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx' },
          { mime: 'video/mp4', ext: 'mp4' }
        ]
        
        const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)]
        const fileName = faker.system.fileName({ extensionCount: 0 })
        
        attachments.push({
          _id: faker.string.uuid(),
          originalName: `${fileName}.${fileType.ext}`,
          fileName: `${faker.string.uuid()}.${fileType.ext}`,
          path: `/uploads/${faker.string.uuid()}.${fileType.ext}`,
          mimeType: fileType.mime,
          size: Math.floor(Math.random() * 5000000) + 50000, // 50KB to 5MB
          messageId: `msg-${i}`,
          uploadedBy: senderId,
          createdAt: messageDate
        })
      }
    }
    
    // Create read status (more likely to be read if older)
    const readBy = []
    // Current user always reads their own messages
    readBy.push({ userId: currentUserId, readAt: messageDate })
    
    // Other participants might have read it
    if (isCurrentUser && Math.random() > 0.3) {
      for (const otherId of otherUserIds) {
        if (Math.random() > 0.4) {
          // Read sometime after the message was sent
          const readDate = new Date(messageDate)
          readDate.setMinutes(readDate.getMinutes() + Math.floor(Math.random() * 60))
          readBy.push({ userId: otherId, readAt: readDate })
        }
      }
    }
    
    messages.push({
      _id: `msg-${i}`,
      chatRoomId,
      senderId,
      content,
      contentType: 'text',
      readBy,
      attachments: attachments.length > 0 ? attachments : undefined,
      createdAt: messageDate,
      updatedAt: messageDate
    })
  }
  
  // Sort by date
  return messages.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
} 