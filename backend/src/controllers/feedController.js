const { sendResponse } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const activityService = require('../services/activityService');

/**
 * @desc    Get recent activity feed
 * @route   GET /api/v1/feed
 * @access  Public
 */
const getFeed = catchAsync(async (req, res) => {
  const activities = await activityService.getRecentActivities();
  res.status(200).json(sendResponse(true, 'Feed fetched successfully', activities));
});

module.exports = {
  getFeed,
};
