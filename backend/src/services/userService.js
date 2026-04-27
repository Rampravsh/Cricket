const User = require('../models/User');
const PlayerProfile = require('../models/PlayerProfile');
const AppError = require('../utils/AppError');

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
  updateProfile,
};
