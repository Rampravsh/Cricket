const { sendResponse } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const playerProfileService = require('../services/playerProfileService');
const performanceService = require('../services/performanceService');

/**
 * @desc    Get player profile by ID
 * @route   GET /api/v1/players/:id
 * @access  Public
 */
const getPlayerProfile = catchAsync(async (req, res) => {
  const { id } = req.params;
  const profile = await playerProfileService.getProfileById(id);
  res.status(200).json(sendResponse(true, 'Player profile fetched successfully', profile));
});

/**
 * @desc    Get player performances
 * @route   GET /api/v1/players/:id/performance
 * @access  Public
 */
const getPlayerPerformances = catchAsync(async (req, res) => {
  const { id } = req.params;
  const performances = await performanceService.getPlayerPerformances(id);
  res.status(200).json(sendResponse(true, 'Player performances fetched successfully', performances));
});

const matchService = require('../services/matchService');
const PlayerProfile = require('../models/PlayerProfile');

/**
 * @desc    Recompute stats for current user
 * @route   POST /api/v1/players/me/recompute-stats
 * @access  Private
 */
const recomputeMyStats = catchAsync(async (req, res) => {
  const profile = await PlayerProfile.findOne({ userId: req.user._id });
  if (!profile) {
    return res.status(404).json(sendResponse(false, 'Player profile not found'));
  }

  const stats = await matchService.recomputePlayerStats(profile._id);
  res.status(200).json(sendResponse(true, 'Stats recomputed from performance source of truth', stats));
});

module.exports = {
  getPlayerProfile,
  getPlayerPerformances,
  recomputeMyStats,
};
