import axios from 'axios';
import { ENV } from '~/constants';

const deviceId = 'device-' + Math.random().toString(36).substring(2, 10);

// ─── Axios Instance ────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-device-id': deviceId,
  },
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Dynamically import store to avoid circular dependency
    const store = require('../store').default;
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      const store = require('../store').default;
      store.dispatch({ type: 'auth/logout' });
      console.warn('[API] Unauthorized — logged out');
    }

    if (status === 500) {
      console.error('[API] Server error:', message);
    }

    return Promise.reject({ status, message });
  }
);

// ─── Match API ─────────────────────────────────────────────────────────────────
export const matchApi = {
  /** Get list of public matches */
  getMatches: () => apiClient.get('/matches/public'),

  /** Get a single match by ID */
  getMatch: (matchId) => apiClient.get(`/matches/${matchId}`),

  /** Create a new match */
  createMatch: (matchData) => apiClient.post('/matches/create', matchData),

  /** Start a match */
  startMatch: (matchId) => apiClient.patch(`/matches/${matchId}/start`),

  /** Add a ball delivery */
  addBall: (matchId, payload) =>
    apiClient.post(`/matches/${matchId}/ball`, payload),
};

// ─── User API ──────────────────────────────────────────────────────────────────
export const userApi = {
  /** Login with Google */
  loginWithGoogle: (idToken) => apiClient.post('/auth/google', { idToken }),

  /** Get current user profile */
  getProfile: () => apiClient.get('/users/me'),

  /** Update profile */
  updateProfile: (data) => apiClient.patch('/users/me', data),

  /** Get user's match history */
  getMatchHistory: () => apiClient.get('/users/me/matches'),
};

// ─── Feed API ──────────────────────────────────────────────────────────────────
export const feedApi = {
  /** Get recent activity feed */
  getFeed: () => apiClient.get('/feed'),
};

export default apiClient;
