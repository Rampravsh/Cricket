const express = require('express');
const matchRoutes = require('./matchRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const playerRoutes = require('./playerRoutes');
const feedRoutes = require('./feedRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/matches', matchRoutes);
router.use('/players', playerRoutes);
router.use('/feed', feedRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
