import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userApi } from './api';
import store from '../store';
import { loginSuccess, logout, setLoading, setError, setUser } from '../store/userSlice';

WebBrowser.maybeCompleteAuthSession();

const AUTH_STORAGE_KEY = '@cricket_auth_data';

/**
 * Auth Service — handles Google login and session persistence
 */
export const authService = {
  /**
   * Persist auth data to storage
   */
  saveAuthData: async (data) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[AuthService] Error saving auth data:', error);
    }
  },

  /**
   * Load auth data from storage
   */
  loadAuthData: async () => {
    try {
      const data = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (data) {
        const parsedData = JSON.parse(data);
        store.dispatch(loginSuccess(parsedData));
        // Refresh profile to get latest stats
        authService.refreshProfile();
      }
    } catch (error) {
      console.error('[AuthService] Error loading auth data:', error);
    }
  },

  /**
   * Refresh user profile from backend
   */
  refreshProfile: async () => {
    try {
      const response = await userApi.getProfile();
      if (response.success) {
        store.dispatch(setUser(response.data));
      }
    } catch (error) {
      console.error('[AuthService] Error refreshing profile:', error);
      if (error.status === 401) {
        authService.logout();
      }
    }
  },

  /**
   * Complete Google Login flow with backend
   */
  handleGoogleLogin: async (idToken) => {
    store.dispatch(setLoading(true));
    try {
      const response = await userApi.loginWithGoogle(idToken);
      if (response.success) {
        const authData = {
          token: response.data.token,
          user: response.data.user,
        };
        store.dispatch(loginSuccess(authData));
        await authService.saveAuthData(authData);
      } else {
        store.dispatch(setError(response.message || 'Login failed'));
      }
    } catch (error) {
      store.dispatch(setError(error.message || 'Login failed'));
    } finally {
      store.dispatch(setLoading(false));
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      store.dispatch(logout());
    } catch (error) {
      console.error('[AuthService] Error during logout:', error);
    }
  },
};

export default authService;
