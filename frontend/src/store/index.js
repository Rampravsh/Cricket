import { configureStore } from '@reduxjs/toolkit';
import matchReducer from './matchSlice';
import authReducer from './authSlice';
import notificationReducer from './notificationSlice';

/**
 * Redux store configuration
 * Add more reducers here as features grow
 */
const store = configureStore({
  reducer: {
    match: matchReducer,
    auth: authReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Allow non-serializable Date objects in state if needed
      serializableCheck: {
        ignoredActions: [],
      },
    }),
  devTools: __DEV__, // Enable Redux DevTools only in development
});

export default store;
