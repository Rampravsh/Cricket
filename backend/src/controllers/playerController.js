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

module.exports = {
  getPlayerProfile,
  getPlayerPerformances,
};
