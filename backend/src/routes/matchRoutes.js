const express = require('express');
const {
  checkHealth,
  createMatch,
  getMatchById,
  addBall,
  getPublicMatches,
} = require('../controllers/matchController');

const router = express.Router();

// Health check
router.get('/health', checkHealth);

// Match management
router.post('/create', createMatch);
router.get('/public', getPublicMatches); // Must be before /:matchId

// Match retrieval and updates
router.get('/:matchId', getMatchById);
router.post('/:matchId/ball', addBall);

module.exports = router;
