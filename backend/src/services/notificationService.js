const Notification = require('../models/Notification');

/**
 * Create a notification for a user.
 * @param {string} userId - User ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
const createNotification = async (userId, title, message) => {
  return await Notification.create({
    userId,
    title,
    message,
  });
};

/**
 * Get user notifications.
 * @param {string} userId - User ID
 * @returns {Array} List of notifications
 */
const getUserNotifications = async (userId) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 });
};

/**
 * Mark notification as read.
 * @param {string} notificationId - Notification ID
 * @returns {Object} Updated notification
 */
const markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { read: true },
    { new: true }
  );
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
};
