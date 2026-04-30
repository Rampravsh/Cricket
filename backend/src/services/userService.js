const User = require('../models/User');
const PlayerProfile = require('../models/PlayerProfile');
const Match = require('../models/Match');
const Activity = require('../models/Activity');
const Notification = require('../modules/notification/notification.model');
const AppError = require('../utils/AppError');
const matchService = require('./matchService');

/**
 * Get user profile by ID including player profile.
 * @param {string} userId - MongoDB user ID
 * @returns {Object} { user, playerProfile }
 */
const getFullProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const playerProfile = await PlayerProfile.findOne({ userId });
  
  return {
    user,
    playerProfile,
    stats: playerProfile ? playerProfile.stats : null,
  };
};

/**
 * Get dashboard data for the current user
 * Task 1 & 6
 */
const getDashboardData = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const playerProfile = await PlayerProfile.findOne({ userId });
  const playerProfileId = playerProfile?._id;

  // Last 5 matches
  const recentMatches = await Match.find({
    $or: [
      { createdByUserId: userId },
      { scorers: userId },
      { 'teams.players.playerId': playerProfileId }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(5)
  .lean();

  // Task 4: Normalize roles for matches
  recentMatches.forEach(match => {
    match.roles = matchService.computeUserRoles(match, userId, playerProfileId);
  });

  // Last 10 activities
  const recentActivity = await Activity.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('matchId', 'matchId status');

  // Unread notification count
  const notificationsCount = await Notification.countDocuments({ userId, read: false });

  return {
    user,
    playerProfile,
    stats: playerProfile ? playerProfile.stats : null,
    recentMatches,
    recentActivity,
    notificationsCount,
  };
};

/**
 * Update allowed user profile fields.
 * Updates User (avatar) and PlayerProfile (displayName).
 * @param {string} userId - MongoDB user ID
 * @param {Object} updates - { displayName?, avatar? }
 * @returns {Object} Updated profile data
 */
const updateProfile = async (userId, updates) => {
  const userUpdates = {};
  if (updates.avatar !== undefined) userUpdates.avatar = updates.avatar;

  const profileUpdates = {};
  if (updates.displayName !== undefined) profileUpdates.displayName = updates.displayName;

  let user = null;
  if (Object.keys(userUpdates).length > 0) {
    user = await User.findByIdAndUpdate(userId, userUpdates, {
      new: true,
      runValidators: true,
    });
  } else {
    user = await User.findById(userId);
  }

  if (!user) throw new AppError('User not found', 404);

  let playerProfile = null;
  if (Object.keys(profileUpdates).length > 0) {
    playerProfile = await PlayerProfile.findOneAndUpdate(
      { userId },
      profileUpdates,
      { new: true, runValidators: true }
    );
  } else {
    playerProfile = await PlayerProfile.findOne({ userId });
  }

  return {
    user,
    playerProfile,
    stats: playerProfile ? playerProfile.stats : null,
  };
};

module.exports = {
  getFullProfile,
  getDashboardData,
  updateProfile,
};
