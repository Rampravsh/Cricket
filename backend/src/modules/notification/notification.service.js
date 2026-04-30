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
    let targetUserId = userId;
    
    // 1. Resolve ID: If not a User, it might be a PlayerProfile ID
    let user = await User.findById(targetUserId).select('fcmTokens');
    
    if (!user) {
      const PlayerProfile = require('../../models/PlayerProfile');
      const profile = await PlayerProfile.findById(targetUserId);
      if (profile) {
        targetUserId = profile.userId;
        user = await User.findById(targetUserId).select('fcmTokens');
      }
    }

    // 2. Save notification in DB using the resolved User ID
    const notification = await Notification.create({
      userId: targetUserId,
      type,
      title,
      message,
      matchId,
      meta,
      status: (type === 'player_invite' || type === 'scorer_request') ? 'pending' : 'none'
    });
    
    // 3. Send Push Notifications (FCM or Expo)
    if (user && user.fcmTokens && user.fcmTokens.length > 0) {
      const expoTokens = user.fcmTokens.filter(token => token.startsWith('ExponentPushToken'));
      const fcmTokens = user.fcmTokens.filter(token => !token.startsWith('ExponentPushToken'));

      // Send Expo Push
      if (expoTokens.length > 0) {
        const { Expo } = require('expo-server-sdk');
        const expo = new Expo();
        const messages = expoTokens.map(token => ({
          to: token,
          sound: 'default',
          title,
          body: message,
          data: { ...meta, type, matchId: String(matchId || '') }
        }));
        
        try {
          const chunks = expo.chunkPushNotifications(messages);
          for (const chunk of chunks) {
            await expo.sendPushNotificationsAsync(chunk);
          }
          logger.info(`Expo push sent to user ${userId}`);
        } catch (expoError) {
          logger.error('Expo send error:', expoError);
        }
      }

      // Send FCM Push
      if (fcmTokens.length > 0) {
        const admin = require('../../config/firebase');
        const messages = fcmTokens.map(token => ({
          token,
          notification: { title, body: message },
          data: { ...meta, type, matchId: String(matchId || '') }
        }));
        
        try {
          await admin.messaging().sendEach(messages);
          logger.info(`FCM push sent to user ${userId}`);
        } catch (fcmError) {
          logger.error('FCM send error:', fcmError);
        }
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
