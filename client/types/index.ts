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