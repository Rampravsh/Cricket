const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markRead);

module.exports = router;
