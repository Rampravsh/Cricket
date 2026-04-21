import { createSlice } from '@reduxjs/toolkit';

/**
 * User slice — manages authenticated user state
 */
const initialState = {
  // User profile
  user: null,

  // Auth state
  isAuthenticated: false,

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
      state.isAuthenticated = true;
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
      state.isAuthenticated = false;
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
export const selectPreferences = (state) => state.user.preferences;
export const selectUserError = (state) => state.user.error;

export default userSlice.reducer;
