const Notification = require('./notification.model');
const User = require('../../models/User');
const { getIO } = require('../../sockets/index');
const logger = require('../../utils/logger');

/**
 * Get all notifications for the authenticated user
 */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { notifications }
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

/**
 * Mark a notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { notification }
    });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

/**
 * Handle actionable notifications (accept/reject)
 */
exports.handleAction = async (req, res) => {
  try {
    const { action } = req.body; // 'accepted' or 'rejected'
    if (!['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: action, read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // If it's a match-related action, we might need to notify the creator
    if (notification.type === 'player_invite' || notification.type === 'scorer_request') {
      const io = getIO();
      if (io && notification.meta && notification.meta.creatorId) {
        // Notify creator about the response
        const { sendNotification } = require('./notification.service');
        await sendNotification({
          userId: notification.meta.creatorId,
          type: 'invite_response',
          title: `Invitation ${action}`,
          message: `${req.user.name} has ${action} your invitation.`,
          matchId: notification.matchId,
          meta: { responderId: req.user.id, action }
        });

        // Emit match:update to sync UI for the creator
        io.to(`user:${notification.meta.creatorId}`).emit("match:update", {
          matchId: notification.matchId,
          action,
          responderId: req.user.id
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: { notification }
    });
  } catch (error) {
    logger.error('Error handling notification action:', error);
    res.status(500).json({ message: 'Error handling notification action' });
  }
};

/**
 * Register FCM token for the user
 */
exports.registerFCMToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { fcmTokens: token }
    });

    res.status(200).json({
      status: 'success',
      message: 'FCM token registered successfully'
    });
  } catch (error) {
    logger.error('Error registering FCM token:', error);
    res.status(500).json({ message: 'Error registering FCM token' });
  }
};
