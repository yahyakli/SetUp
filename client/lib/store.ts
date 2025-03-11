import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import TeamsReducer from './features/TeamsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    teams: TeamsReducer
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;