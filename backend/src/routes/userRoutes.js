/**
 * @route   /api/v1/users
 * @desc    Routes for managing user profiles and preferences.
 */
const express = require('express');

const { getMe, updateMe, getDashboard } = require('../controllers/userController');
const { getMyMatches } = require('../controllers/matchController');
const { registerFCMToken } = require('../modules/notification/notification.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(protect);

// GET  /api/v1/users/me/dashboard
router.get('/me/dashboard', getDashboard);

// GET  /api/v1/users/me
router.get('/me', getMe);

// PATCH /api/v1/users/me
router.patch('/me', updateMe);

// GET /api/v1/users/me/matches
router.get('/me/matches', getMyMatches);

// POST /api/v1/users/register-fcm-token
router.post('/register-fcm-token', registerFCMToken);

module.exports = router;
