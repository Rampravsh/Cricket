const { sendResponse } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const notificationService = require('../services/notificationService');

/**
 * @desc    Get current user notifications
 * @route   GET /api/v1/notifications
 * @access  Private
 */
const getNotifications = catchAsync(async (req, res) => {
  const notifications = await notificationService.getUserNotifications(req.user._id);
  res.status(200).json(sendResponse(true, 'Notifications fetched successfully', notifications));
});

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Private
 */
const markRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const notification = await notificationService.markAsRead(id);
  res.status(200).json(sendResponse(true, 'Notification marked as read', notification));
});

module.exports = {
  getNotifications,
  markRead,
};
