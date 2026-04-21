const express = require('express');
const { checkHealth, getMatches } = require('../controllers/matchController');

const router = express.Router();

router.get('/health', checkHealth);
router.get('/', getMatches);

module.exports = router;
