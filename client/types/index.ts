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