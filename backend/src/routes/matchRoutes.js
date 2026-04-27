const express = require('express');
const {
  checkHealth,
  createMatch,
  getMatchById,
  startMatch,
  addBall,
  getPublicMatches,
} = require('../controllers/matchController');

const { protect } = require('../middleware/auth');

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
router.patch('/:matchId/start', startMatch);
router.post('/:matchId/ball', addBall);

module.exports = router;
