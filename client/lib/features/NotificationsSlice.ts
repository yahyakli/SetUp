import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "@/types/index";

// Define the initial state
interface NotificationsState {
  notifications: Notification[];
  notificationLoading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  notificationLoading: false,
  error: null,
};

// Create slice
const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotificationsLoading: (state, action: PayloadAction<boolean>) => {
      state.notificationLoading = action.payload;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
    },
    initNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.map(notif => {
        if (notif._id === action.payload) {
          notif.read = true;
        }
        return notif;
      })
    },
    markAllNotificationsAsRead: (state, action: PayloadAction<string[]>) => {
      state.notifications = state.notifications.map(notif => {
        if (action.payload.includes(notif._id)) {
          notif.read = true;
        }
        return notif;
      })
    }
  },
});

export const { setNotificationsLoading, addNotification, initNotifications,  markAllNotificationsAsRead} = notificationSlice.actions;
export default notificationSlice.reducer;
