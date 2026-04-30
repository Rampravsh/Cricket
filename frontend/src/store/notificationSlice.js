import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationApi, matchApi } from '~/services/api';

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

export const fetchNotificationsThunk = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationApi.getNotifications();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationReadThunk = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await notificationApi.markRead(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to mark notification as read');
    }
  }
);

export const handleNotificationActionThunk = createAsyncThunk(
  'notifications/handleAction',
  async ({ id, action }, { rejectWithValue }) => {
    try {
      const res = await notificationApi.handleAction(id, action);
      return { id, notification: res.data.notification };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to process notification action');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload?.notifications || [];
        state.unreadCount = state.notifications.filter((n) => !n.read).length;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationReadThunk.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n._id === action.payload);
        if (index !== -1 && !state.notifications[index].read) {
          state.notifications[index].read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(handleNotificationActionThunk.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n._id === action.payload.id);
        if (index !== -1) {
          state.notifications[index] = action.payload.notification;
        }
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
