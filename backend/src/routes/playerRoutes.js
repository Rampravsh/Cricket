const express = require('express');
const playerController = require('../controllers/playerController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:id', playerController.getPlayerProfile);
router.get('/:id/performance', playerController.getPlayerPerformances);

// Recompute stats from performance (Source of Truth)
router.post('/me/recompute-stats', protect, playerController.recomputeMyStats);

module.exports = router;
