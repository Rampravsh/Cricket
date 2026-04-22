import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { matchApi } from '~/services/api';

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

// ─── Async Thunks ─────────────────────────────────────────────────────────────
export const createMatchThunk = createAsyncThunk('match/create', async (matchData, { rejectWithValue }) => {
  try {
    const res = await matchApi.createMatch(matchData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to create match');
  }
});

export const fetchMatchThunk = createAsyncThunk('match/fetch', async (matchId, { rejectWithValue }) => {
  try {
    const res = await matchApi.getMatch(matchId);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch match');
  }
});

export const startMatchThunk = createAsyncThunk('match/start', async (matchId, { rejectWithValue }) => {
  try {
    const res = await matchApi.startMatch(matchId);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to start match');
  }
});

export const addBallThunk = createAsyncThunk('match/addBall', async ({ matchId, payload }, { rejectWithValue }) => {
  try {
    const res = await matchApi.addBall(matchId, payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to add ball');
  }
});

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

    // Handle updates from socket
    setMatchFromSocket: (state, action) => {
      const matchData = action.payload;
      if (!matchData?.matchId) return;

      state.currentMatch = matchData;
      
      if (matchData.teams && matchData.teams.length > 0) {
        state.score.teamA.name = matchData.teams[0]?.name || '';
        state.score.teamB.name = matchData.teams[1]?.name || '';
      }

      if (matchData.score) {
        state.score.teamA.runs = matchData.score.runs || 0;
        state.score.teamA.wickets = matchData.score.wickets || 0;
        state.score.teamA.balls = matchData.score.balls || 0;
        state.score.teamA.overs = matchData.score.overs || 0;
      }
      
      if (matchData.balls && matchData.balls.length > 0) {
        const currentOverNumber = matchData.balls[matchData.balls.length - 1].over;
        state.currentOver = matchData.balls.filter(b => b.over === currentOverNumber).map(b => b.runs + (b.wicket ? 'W' : ''));
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
  extraReducers: (builder) => {
    // Shared pending/rejected/fulfilled states for match operations
    builder
      .addMatcher(
        (action) => action.type.startsWith('match/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('match/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('match/') && action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.isLoading = false;
          // Support accessing standard res.data (if interceptor wrapped)
          const matchData = action.payload?.data || action.payload; 
          
          if (matchData?.matchId) {
            state.currentMatch = matchData;
            
            // Map backend simple `score` field to `score.teamA` (since currently single innings is supported)
            if (matchData.teams && matchData.teams.length > 0) {
              state.score.teamA.name = matchData.teams[0]?.name || '';
              state.score.teamB.name = matchData.teams[1]?.name || '';
            }

            if (matchData.score) {
              state.score.teamA.runs = matchData.score.runs || 0;
              state.score.teamA.wickets = matchData.score.wickets || 0;
              state.score.teamA.balls = matchData.score.balls || 0;
              state.score.teamA.overs = matchData.score.overs || 0;
            }
            
            if (matchData.balls) {
               // Update currentOver by taking the most recent ball's over and finding all balls in that over
               if (matchData.balls.length > 0) {
                 const currentOverNumber = matchData.balls[matchData.balls.length - 1].over;
                 state.currentOver = matchData.balls.filter(b => b.over === currentOverNumber).map(b => b.runs + (b.wicket ? 'W' : ''));
               }
            }
          }
        }
      );
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
  setMatchFromSocket,
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
