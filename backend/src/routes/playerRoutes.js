const express = require('express');
const playerController = require('../controllers/playerController');

const router = express.Router();

router.get('/:id', playerController.getPlayerProfile);
router.get('/:id/performance', playerController.getPlayerPerformances);

module.exports = router;
