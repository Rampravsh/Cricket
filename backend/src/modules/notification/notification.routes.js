const express = require('express');
const notificationController = require('./notification.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

// All notification routes are protected
router.use(protect);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/:id/action', notificationController.handleAction);

// This one could also be in user routes, but keeping it here as requested
router.post('/register-fcm-token', notificationController.registerFCMToken);

module.exports = router;
