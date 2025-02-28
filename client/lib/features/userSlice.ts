
import { User } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: Cookies.get('token') || null,
  user: null,
  isAuthenticated: !!Cookies.get('token'),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; user: User, rememberMe: boolean }>) => {
      const { token, user, rememberMe } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;

      // Set cookie with expiration date based on rememberMe
      const expirationDays = rememberMe ? 7 : 1;
      Cookies.set('token', token, { expires: expirationDays });
    },
    register: (state, action: PayloadAction<{ token: string; user: User }>) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;

      // Set cookie with default expiration (1 day)
      Cookies.set('token', token, { expires: 1 });
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;

      // Remove token cookie on logout
      Cookies.remove('token');
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
});

export const { login, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;