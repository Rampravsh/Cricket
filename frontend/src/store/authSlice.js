import { createSlice } from '@reduxjs/toolkit';

/**
 * Auth slice — manages authentication and user profile state
 */
const initialState = {
  user: null,
  playerProfile: null,
  token: null,
  isLoggedIn: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.playerProfile = action.payload.playerProfile || null;
      state.isLoggedIn = !!action.payload.token;
      state.error = null;
    },
    setPlayerProfile: (state, action) => {
      state.playerProfile = action.payload;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.playerProfile = action.payload.playerProfile || null;
      state.isLoggedIn = true;
      state.isLoading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.playerProfile = null;
      state.isLoggedIn = false;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setAuth,
  setPlayerProfile,
  loginSuccess,
  logout,
  setLoading,
  setError,
  clearError,
} = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectPlayerProfile = (state) => state.auth.playerProfile;
export const selectToken = (state) => state.auth.token;
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
