const Notification = require('./notification.model');
const User = require('../../models/User');
const logger = require('../../utils/logger');
const { getIO } = require('../../sockets/index');

/**
 * Send notification to a user via DB, FCM and Socket.IO
 * 
 * @param {Object} params
 * @param {string} params.userId - Receiver user ID
 * @param {string} params.type - Notification type (player_invite, invite_response, etc.)
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification body
 * @param {string} [params.matchId] - Optional match reference
 * @param {Object} [params.meta] - Flexible data object
 */
const sendNotification = async ({
  userId,
  type,
  title,
  message,
  matchId = null,
  meta = {}
}) => {
  try {
    // 1. Save notification in DB
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      matchId,
      meta,
      status: (type === 'player_invite' || type === 'scorer_request') ? 'pending' : 'none'
    });

    // 2. Fetch user's FCM tokens
    const user = await User.findById(userId).select('fcmTokens');
    
    // 3. Send FCM push
    if (user && user.fcmTokens && user.fcmTokens.length > 0) {
      const admin = require('../../config/firebase');
      const payload = { 
        notification: { title, body: message }, 
        data: { ...meta, type, matchId: String(matchId || '') } 
      };
      
      try {
        const messages = user.fcmTokens.map(token => ({
          token,
          notification: payload.notification,
          data: payload.data
        }));
        await admin.messaging().sendEach(messages);
        logger.info(`FCM push sent to user ${userId}`);
      } catch (fcmError) {
        logger.error('FCM send error:', fcmError);
      }
    }

    // 4. Emit via Socket.IO
    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit("notification:new", notification);
      logger.info(`Socket notification emitted to room user:${userId}`);
    }

    return notification;
  } catch (error) {
    logger.error('Error sending notification:', error);
    throw error;
  }
};

module.exports = {
  sendNotification
};
