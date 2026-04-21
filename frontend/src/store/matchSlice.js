import { createSlice } from '@reduxjs/toolkit';

/**
 * Match slice — manages live match state
 * Extend reducers as backend integration is added
 */
const initialState = {
  // Current match info
  currentMatch: null,

  // Live score data
  score: {
    teamA: {
      name: '',
      shortName: '',
      runs: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
    },
    teamB: {
      name: '',
      shortName: '',
      runs: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
    },
  },

  // Current innings (1 or 2)
  currentInnings: 1,

  // Batting team id ('teamA' | 'teamB')
  battingTeam: 'teamA',

  // Ball-by-ball log for current over
  currentOver: [],

  // All deliveries this innings
  deliveries: [],

  // Match status ('upcoming' | 'live' | 'completed')
  status: 'upcoming',

  // Target (set after 1st innings)
  target: null,

  // Loading state for async actions
  isLoading: false,
  error: null,
};

const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    // Set full match data (from API)
    setMatch: (state, action) => {
      state.currentMatch = action.payload;
    },

    // Update live score
    updateScore: (state, action) => {
      const { team, runs, wickets, balls } = action.payload;
      if (state.score[team]) {
        state.score[team].runs = runs ?? state.score[team].runs;
        state.score[team].wickets = wickets ?? state.score[team].wickets;
        state.score[team].balls = balls ?? state.score[team].balls;
        state.score[team].overs = Math.floor(
          (balls ?? state.score[team].balls) / 6
        );
      }
    },

    // Add a delivery to the current over
    addDelivery: (state, action) => {
      state.currentOver.push(action.payload);
      state.deliveries.push(action.payload);
    },

    // Move to next over (clear current over log)
    nextOver: (state) => {
      state.currentOver = [];
    },

    // Set batting team
    setBattingTeam: (state, action) => {
      state.battingTeam = action.payload;
    },

    // Switch innings
    switchInnings: (state) => {
      state.currentInnings = state.currentInnings === 1 ? 2 : 1;
      state.currentOver = [];
      // Set target from 1st innings
      const firstBattingTeam = state.battingTeam;
      state.target = state.score[firstBattingTeam].runs + 1;
      state.battingTeam = firstBattingTeam === 'teamA' ? 'teamB' : 'teamA';
    },

    // Set match status
    setMatchStatus: (state, action) => {
      state.status = action.payload;
    },

    // Set team names
    setTeams: (state, action) => {
      const { teamA, teamB } = action.payload;
      if (teamA) {
        state.score.teamA.name = teamA.name || '';
        state.score.teamA.shortName = teamA.shortName || '';
      }
      if (teamB) {
        state.score.teamB.name = teamB.name || '';
        state.score.teamB.shortName = teamB.shortName || '';
      }
    },

    // Reset full match state
    resetMatch: () => initialState,

    // Set loading
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setMatch,
  updateScore,
  addDelivery,
  nextOver,
  setBattingTeam,
  switchInnings,
  setMatchStatus,
  setTeams,
  resetMatch,
  setLoading,
  setError,
} = matchSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectCurrentMatch = (state) => state.match.currentMatch;
export const selectScore = (state) => state.match.score;
export const selectBattingTeam = (state) => state.match.battingTeam;
export const selectCurrentOver = (state) => state.match.currentOver;
export const selectMatchStatus = (state) => state.match.status;
export const selectTarget = (state) => state.match.target;
export const selectIsLoading = (state) => state.match.isLoading;

export default matchSlice.reducer;
