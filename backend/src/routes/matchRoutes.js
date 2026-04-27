const express = require('express');
const {
  checkHealth,
  createMatch,
  getMatchById,
  startMatch,
  addBall,
  getPublicMatches,
  invitePlayer,
  playerResponse,
  requestScorer,
  scorerResponse,
} = require('../controllers/matchController');

const { protect } = require('../middleware/auth');
const { canScoreMatch } = require('../middleware/matchMiddleware');

const router = express.Router();

// Health check
router.get('/health', checkHealth);

// Match retrieval (Public)
router.get('/public', getPublicMatches);
router.get('/:matchId', getMatchById);

// Protected routes
router.use(protect);

// Match management
router.post('/create', createMatch);
router.patch('/:matchId/start', canScoreMatch, startMatch);
router.post('/:matchId/ball', canScoreMatch, addBall);

// New Match Flows
router.post('/:id/invite-player', invitePlayer);
router.patch('/:id/player-response', playerResponse);
router.post('/:id/request-scorer', requestScorer);
router.patch('/:id/scorer-response', scorerResponse);

module.exports = router;
