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

  /** Invite a player to a match */
  invitePlayer: (id, payload) => apiClient.post(`/matches/${id}/invite-player`, payload),

  /** Respond to a match invitation */
  respondInvitation: (id, status) => apiClient.patch(`/matches/${id}/player-response`, { status }),

  /** Request to be a scorer */
  requestScorer: (id) => apiClient.post(`/matches/${id}/request-scorer`),

  /** Respond to a scorer request */
  respondScorerRequest: (id, payload) => apiClient.patch(`/matches/${id}/scorer-response`, payload),

  /** Replace a player in a match */
  replacePlayer: (id, payload) => apiClient.patch(`/matches/${id}/replace-player`, payload),
};

// ─── Player API ───────────────────────────────────────────────────────────────
export const playerApi = {
  /** Search players by name or username */
  searchPlayers: (query) => apiClient.get(`/players/search?q=${query}`),
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
  /** Register FCM token */
  registerFCMToken: (token) => apiClient.post('/users/register-fcm-token', { token }),
};

// ─── Feed API ──────────────────────────────────────────────────────────────────
export const feedApi = {
  /** Get recent activity feed */
  getFeed: () => apiClient.get('/feed'),
};

// ─── Notification API ─────────────────────────────────────────────────────────
export const notificationApi = {
  /** Get user notifications */
  getNotifications: () => apiClient.get('/notifications'),
  /** Mark notification as read */
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  /** Handle actionable notification */
  handleAction: (id, action) => apiClient.patch(`/notifications/${id}/action`, { action }),
};

export default apiClient;
