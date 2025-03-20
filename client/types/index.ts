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
  id: number;
  team_id: number;
  user_id: number;
  team: Team;
  role: string;
  token: string;
  status: string;
  accepted_at: string;
  declined_at: string;
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
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  project_id: number;
  assignee_id: string;
  creator_id: string;
  due_date: Date | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  label: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Attachment {
  // Backend attachment properties
  id?: string;
  task_id?: string;
  attachment_type?: string;
  attachment_url?: string;
  original_filename?: string;
  file_size?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  
  // Form upload properties
  file?: File;
  preview?: string;
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