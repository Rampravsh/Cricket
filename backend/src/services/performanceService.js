const Performance = require('../models/Performance');
const AppError = require('../utils/AppError');

/**
 * Get all performances for a player.
 * @param {string} playerId - PlayerProfile ID
 * @returns {Array} List of performances
 */
const getPlayerPerformances = async (playerId) => {
  return await Performance.find({ playerId })
    .populate('matchId')
    .sort({ createdAt: -1 });
};

/**
 * Create or update performance record.
 * @param {Object} data - Performance data
 * @returns {Object} Performance document
 */
const upsertPerformance = async (data) => {
  const { matchId, playerId } = data;
  return await Performance.findOneAndUpdate(
    { matchId, playerId },
    data,
    { upsert: true, new: true }
  );
};

module.exports = {
  getPlayerPerformances,
  upsertPerformance,
};
