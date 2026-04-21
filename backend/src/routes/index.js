const express = require('express');
const matchRoutes = require('./matchRoutes');

const router = express.Router();

// Mount routes
router.use('/matches', matchRoutes);

module.exports = router;
