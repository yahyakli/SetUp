export interface Message {
  _id: string;
  content: string;
  senderId: string;
  chatRoomId: string;
  createdAt: Date;
  updatedAt: Date;
  readBy?: Array<{ userId: string; readAt: Date }>;
  attachments?: Array<any>;
  contentType?: string;
  parentMessageId?: string;
} 