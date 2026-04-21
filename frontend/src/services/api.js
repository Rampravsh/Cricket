import axios from 'axios';
import { ENV } from '~/constants';

// ─── Axios Instance ────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Attach auth token from AsyncStorage / Redux store
    // const token = store.getState().user.token;
    // if (token) config.headers.Authorization = `Bearer ${token}`;
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
      // TODO: dispatch logout() from store
      console.warn('[API] Unauthorized — should logout');
    }

    if (status === 500) {
      console.error('[API] Server error:', message);
    }

    return Promise.reject({ status, message });
  }
);

// ─── Match API ─────────────────────────────────────────────────────────────────
export const matchApi = {
  /** Get list of all matches */
  getMatches: () => apiClient.get('/matches'),

  /** Get a single match by ID */
  getMatch: (matchId) => apiClient.get(`/matches/${matchId}`),

  /** Get live match score */
  getLiveScore: (matchId) => apiClient.get(`/matches/${matchId}/score`),

  /** Create a new match */
  createMatch: (matchData) => apiClient.post('/matches', matchData),

  /** Update match (admin) */
  updateMatch: (matchId, data) => apiClient.patch(`/matches/${matchId}`, data),

  /** Add a delivery */
  addDelivery: (matchId, delivery) =>
    apiClient.post(`/matches/${matchId}/deliveries`, delivery),
};

// ─── User API ──────────────────────────────────────────────────────────────────
export const userApi = {
  /** Login */
  login: (credentials) => apiClient.post('/auth/login', credentials),

  /** Register */
  register: (userData) => apiClient.post('/auth/register', userData),

  /** Get current user profile */
  getProfile: () => apiClient.get('/auth/me'),

  /** Update profile */
  updateProfile: (data) => apiClient.patch('/auth/me', data),

  /** Logout */
  logout: () => apiClient.post('/auth/logout'),
};

export default apiClient;
