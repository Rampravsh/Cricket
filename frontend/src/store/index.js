import { configureStore } from '@reduxjs/toolkit';
import matchReducer from './matchSlice';
import userReducer from './userSlice';

/**
 * Redux store configuration
 * Add more reducers here as features grow
 */
const store = configureStore({
  reducer: {
    match: matchReducer,
    user: userReducer,
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
