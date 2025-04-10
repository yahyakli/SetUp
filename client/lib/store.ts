import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import TeamsReducer from './features/TeamsSlice';
import ProjectReducer from './features/ProjectsSlice';
import InvitationsReducer from './features/InvitationsSlice';
import TaskReducer from './features/TasksSlice';
import NotificationReducer from './features/NotificationsSlice';
export const store = configureStore({
  reducer: {
    user: userReducer,
    teams: TeamsReducer,
    projects: ProjectReducer,
    Invitations: InvitationsReducer,
    tasks: TaskReducer,
    notification: NotificationReducer
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;