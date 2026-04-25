const express = require('express');
const matchRoutes = require('./matchRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/matches', matchRoutes);

module.exports = router;
