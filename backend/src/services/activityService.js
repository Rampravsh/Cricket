const Activity = require('../models/Activity');

/**
 * Create a new activity.
 * @param {string} userId - User ID
 * @param {string} type - Activity type
 * @param {string} matchId - Optional match ID
 * @param {Object} meta - Optional meta data
 */
const createActivity = async (userId, type, matchId = null, meta = null) => {
  return await Activity.create({
    userId,
    type,
    matchId,
    meta,
  });
};

/**
 * Get recent activity feed.
 * @param {number} limit - Number of items to return
 * @returns {Array} List of activities
 */
const getRecentActivities = async (limit = 20) => {
  return await Activity.find()
    .populate('userId', 'name avatar')
    .populate('matchId')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = {
  createActivity,
  getRecentActivities,
};
