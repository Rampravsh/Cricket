const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Get user profile by ID.
 * @param {string} userId - MongoDB user ID
 * @returns {Object} User document
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

/**
 * Update allowed user profile fields.
 * Only name and avatar can be updated by the user.
 * @param {string} userId - MongoDB user ID
 * @param {Object} updates - { name?, avatar? }
 * @returns {Object} Updated user document
 */
const updateProfile = async (userId, updates) => {
  const allowedFields = ['name', 'avatar'];
  const sanitized = {};

  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      sanitized[key] = updates[key];
    }
  }

  if (Object.keys(sanitized).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const user = await User.findByIdAndUpdate(userId, sanitized, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

module.exports = {
  getUserById,
  updateProfile,
};
