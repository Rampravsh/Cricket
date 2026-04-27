const PlayerProfile = require('../models/PlayerProfile');
const AppError = require('../utils/AppError');

/**
 * Get or create player profile for a user.
 * @param {string} userId - MongoDB user ID
 * @param {string} displayName - Name to display for the player
 * @returns {Object} PlayerProfile document
 */
const getOrCreateProfile = async (userId, displayName) => {
  let profile = await PlayerProfile.findOne({ userId });

  if (!profile) {
    profile = await PlayerProfile.create({
      userId,
      displayName,
      role: 'allrounder',
    });
  }

  return profile;
};

/**
 * Get player profile by ID with stats.
 * @param {string} profileId - MongoDB PlayerProfile ID
 * @returns {Object} PlayerProfile document
 */
const getProfileById = async (profileId) => {
  const profile = await PlayerProfile.findById(profileId);
  if (!profile) {
    throw new AppError('Player profile not found', 404);
  }
  return profile;
};

/**
 * Update player profile.
 * @param {string} userId - User ID
 * @param {Object} updates - { displayName, role }
 * @returns {Object} Updated profile
 */
const updateProfile = async (userId, updates) => {
  const profile = await PlayerProfile.findOneAndUpdate(
    { userId },
    updates,
    { new: true, runValidators: true }
  );

  if (!profile) {
    throw new AppError('Player profile not found', 404);
  }

  return profile;
};

module.exports = {
  getOrCreateProfile,
  getProfileById,
  updateProfile,
};
