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
/**
 * Handle actionable notifications (accept/reject)
 */
exports.handleAction = async (req, res) => {
  try {
    const { action } = req.body; // 'accepted' or 'rejected'
    if (!['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Perform the actual business logic update
    const Match = require('../../models/Match');
    const match = await Match.findById(notification.matchId);
    
    if (match) {
      if (notification.type === 'player_invite') {
        const playerIndex = match.players.findIndex(p => p.playerId?.toString() === req.user.id.toString());
        if (playerIndex !== -1) {
          match.players[playerIndex].status = action;
          await match.save();
        }
      } else if (notification.type === 'scorer_request') {
        const requestIndex = match.scorerRequests.findIndex(r => r.userId?.toString() === notification.userId.toString());
        // Wait, for scorer_request, the notification is for the CREATOR.
        // The action is taken by the creator on behalf of the requester.
        // We need the requesterId from meta.
        const requesterId = notification.meta?.requesterId;
        const matchScorerReqIndex = match.scorerRequests.findIndex(r => r.userId?.toString() === requesterId?.toString());
        
        if (matchScorerReqIndex !== -1) {
          match.scorerRequests[matchScorerReqIndex].status = action;
          if (action === 'accepted') {
            if (!match.scorers.includes(requesterId)) {
              match.scorers.push(requesterId);
            }
          }
          await match.save();
        }
      }
      
      // Emit update to match room
      const io = getIO();
      if (io) {
        io.to(match.matchId).emit('score-updated', match);
      }
    }

    notification.status = action;
    notification.read = true;
    await notification.save();

    // If it's a match-related action, we might need to notify the creator or requester
    if (notification.type === 'player_invite' || notification.type === 'scorer_request') {
      const io = getIO();
      const { sendNotification } = require('./notification.service');
      
      if (notification.type === 'player_invite' && notification.meta?.creatorId) {
        await sendNotification({
          userId: notification.meta.creatorId,
          type: 'invite_response',
          title: `Invitation ${action}`,
          message: `${req.user.name} has ${action} your invitation.`,
          matchId: notification.matchId,
          meta: { responderId: req.user.id, action }
        });
      } else if (notification.type === 'scorer_request') {
        const requesterId = notification.meta?.requesterId;
        if (requesterId) {
          await sendNotification({
            userId: requesterId,
            type: 'scorer_response',
            title: `Scorer Request ${action}`,
            message: `Your request to score match ${match?.matchId || ''} was ${action}`,
            matchId: notification.matchId,
            meta: { status: action, creatorId: req.user.id }
          });
        }
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
