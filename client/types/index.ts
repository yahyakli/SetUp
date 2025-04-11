export interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invitation {
  _id: string;
  teamId: number;
  userId: number;
  teamName: string;
  role: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  status: string;
  owner_id: string;
  teams: Team[];
  tasks: Task[];
  created_at: Date;
  updated_at: Date;
}

export interface TeamMember {
  id: number;
  team_id: number;
  user_id: string;
  role: string
}

export interface Team {
  id: number;
  name: string;
  description: string;
  members: TeamMember[];
  created_at: Date;
  updated_at: Date;
  projects: Project[] | null;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  project_id: number;
  team_id: number | null;
  assignee_id: string | null;
  creator_id: string;
  due_date: Date | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  label: string | null;
  attachments: Attachment[];
  comments: Comment[];
  created_at: Date;
  updated_at: Date;
}

export interface Attachment {
  // Backend attachment properties
  _id?: string;
  task_id?: string;
  attachment_type?: string;
  attachment_url?: string;
  original_filename?: string;
  file_size?: number;
  uploaded_by: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  
  // Form upload properties
  file?: File;
  preview?: string;
}

export interface Comment {
  _id: string;
  task_id: string;
  project_id: number;
  creator_id: string;
  comment: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface AuthContextType {
  state: AuthState;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export interface ReadBy {
  userId: string;
  readAt: Date;
}

export interface Message {
  _id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  parentMessageId?: string
  contentType: 'text' | 'file';
  readBy: ReadBy[];
  attachments?: MessageAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatRoom {
  _id: string;
  name: string;
  type: 'project' | 'direct';
  projectId?: number;
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: Message;
}

export interface MessageAttachment {
  _id: string;
  originalName: string;
  fileName: string;
  path: string;
  mimeType: string;
  size: number;
  messageId: string;
  uploadedBy: string;
  createdAt: Date;
}

export interface Notification {
  _id: string;
  title: string;
  userId: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: Date;
}