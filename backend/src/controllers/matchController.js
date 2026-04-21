const { sendResponse } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const Match = require('../models/Match');

/**
 * @desc    Health check route
 * @route   GET /api/v1/health
 * @access  Public
 */
const checkHealth = catchAsync(async (req, res) => {
  res.status(200).json(
    sendResponse(true, 'Server is healthy', {
      uptime: process.uptime(),
      timestamp: Date.now(),
    })
  );
});

/**
 * @desc    Get all matches
 * @route   GET /api/v1/matches
 * @access  Public
 */
const getMatches = catchAsync(async (req, res) => {
  const matches = await Match.find({});
  res.status(200).json(sendResponse(true, 'Matches fetched successfully', matches));
});

module.exports = {
  checkHealth,
  getMatches,
};
