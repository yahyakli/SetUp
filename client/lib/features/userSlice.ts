import { User } from '@/types';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import axios from 'axios';
import { USERS_SERVICE_URL } from '@/constants/API_URLS';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  token: Cookies.get('token') || null,
  user: null,
  isAuthenticated: !!Cookies.get('token'),
  isLoading: false,
};

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (_, { getState, dispatch }) => {
    const state = getState() as { user: AuthState };
    const token = state.user.token;

    if (token) {
      try {
        const response = await axios.get(USERS_SERVICE_URL + '/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            dispatch(logout());
          }
        }
        throw error;
      }
    }
    return null;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; user: User, rememberMe: boolean }>) => {
      const { token, user, rememberMe } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;

      const expirationDays = rememberMe ? 7 : 1;
      Cookies.set('token', token, { expires: expirationDays });
    },
    register: (state, action: PayloadAction<{ token: string; user: User }>) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;

      Cookies.set('token', token, { expires: 1 });
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;

      Cookies.remove('token');
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { login, logout, register, updateUser } = userSlice.actions;
export default userSlice.reducer;