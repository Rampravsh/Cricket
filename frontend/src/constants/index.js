// App-wide constants and environment configuration
// In production, use react-native-dotenv or expo-constants for .env support

export const ENV = {
  // Base API URL — change this to your backend URL
  API_BASE_URL: 'http://10.149.179.72:5000/api/v1',

  // WebSocket URL for live match updates
  SOCKET_URL: 'ws://10.149.179.72:5000',

  // App version
  APP_VERSION: '1.0.0',

  // Request timeout in milliseconds
  REQUEST_TIMEOUT: 10000,
};

// Cricket scoring constants
export const SCORE_VALUES = {
  DOT_BALL: 0,
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  SIX: 6,
  WIDE: 'WD',
  NO_BALL: 'NB',
  WICKET: 'W',
  LEG_BYE: 'LB',
  BYE: 'B',
};

// Match types
export const MATCH_TYPES = {
  T20: 'T20',
  ODI: 'ODI',
  TEST: 'TEST',
  T10: 'T10',
};

// Navigation screen names
export const SCREENS = {
  HOME: 'Home',
  LIVE_MATCH: 'LiveMatch',
  MATCH_LIST: 'MatchList',
  SCORECARD: 'Scorecard',
  SETTINGS: 'Settings',
  QUICK_MATCH: 'QuickMatch',
  HISTORY: 'History',
  PROFILE: 'Profile',
  MAIN_TABS: 'MainTabs',
};
