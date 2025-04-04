import { ChatRoom, Message, MessageAttachment } from '@/types'
import { faker } from '@faker-js/faker'

// Generate fake chat rooms
export function generateFakeChatRooms(currentUserId: string): ChatRoom[] {
  const chatRooms: ChatRoom[] = []
  
  // Generate 3 direct chats
  for (let i = 0; i < 3; i++) {
    const otherUserId = `user${i + 1}`
    const otherUserName = faker.person.fullName()
    
    const lastMessage = {
      _id: faker.string.uuid(),
      chatRoomId: `chat${i}`,
      senderId: Math.random() > 0.5 ? currentUserId : otherUserId,
      content: faker.lorem.sentence(),
      contentType: 'text' as const,
      readBy: [{ userId: currentUserId, readAt: faker.date.recent() }],
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent()
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
  
  // Generate 2 project chats
  for (let i = 0; i < 2; i++) {
    const projectId = i + 1
    const projectName = faker.company.name() + ' Project'
    
    const participants = [currentUserId]
    for (let j = 0; j < 3; j++) {
      participants.push(`user${j + 10}`)
    }
    
    const lastMessage = {
      _id: faker.string.uuid(),
      chatRoomId: `project${i}`,
      senderId: participants[Math.floor(Math.random() * participants.length)],
      content: faker.lorem.sentence(),
      contentType: 'text' as const,
      readBy: [{ userId: currentUserId, readAt: faker.date.recent() }],
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent()
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
    if (!a.lastMessage || !b.lastMessage) return 0
    return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  })
}

// Generate fake messages for a chat room
export function generateFakeMessages(chatRoomId: string, currentUserId: string): Message[] {
  const messages: Message[] = []
  const otherUserId = `user${Math.floor(Math.random() * 5) + 1}`
  
  // Generate between 10-20 messages
  const messageCount = Math.floor(Math.random() * 10) + 10
  
  for (let i = 0; i < messageCount; i++) {
    const isCurrentUser = Math.random() > 0.4
    const senderId = isCurrentUser ? currentUserId : otherUserId
    const messageDate = faker.date.recent({ days: 5 })
    
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
    
    messages.push({
      _id: `msg-${i}`,
      chatRoomId,
      senderId,
      content: faker.lorem.sentence(),
      contentType: 'text',
      readBy: [{ userId: currentUserId, readAt: messageDate }],
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