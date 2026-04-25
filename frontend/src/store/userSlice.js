import { createSlice } from '@reduxjs/toolkit';

/**
 * User slice — manages authenticated user state
 */
const initialState = {
  // User profile
  user: null,

  // Auth state
  token: null,
  isAuthenticated: false,
  isLoggedIn: false, // Added for explicit login state

  // User preferences
  preferences: {
    favoriteTeam: null,
    notificationsEnabled: true,
    defaultMatchType: 'T20',
  },

  // Loading & error
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set user after login
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoggedIn = !!action.payload;
      state.error = null;
    },

    // Login success
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoggedIn = true;
      state.isLoading = false;
      state.error = null;
    },

    // Update user profile fields
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Update preferences
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },

    // Log out
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoggedIn = false;
      state.preferences = initialState.preferences;
    },

    // Set loading
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setUser,
  loginSuccess,
  updateUserProfile,
  updatePreferences,
  logout,
  setLoading,
  setError,
  clearError,
} = userSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectUser = (state) => state.user.user;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectIsLoggedIn = (state) => state.user.isLoggedIn;
export const selectToken = (state) => state.user.token;
export const selectPreferences = (state) => state.user.preferences;
export const selectUserError = (state) => state.user.error;
export const selectUserLoading = (state) => state.user.isLoading;

export default userSlice.reducer;
