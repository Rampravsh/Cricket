const { sendResponse } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const userService = require('../services/userService');

/**
 * @desc    Get current authenticated user's profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
const getMe = catchAsync(async (req, res) => {
  const profile = await userService.getFullProfile(req.user._id);
  res.status(200).json(sendResponse(true, 'Profile fetched successfully', profile));
});

/**
 * @desc    Update current authenticated user's profile
 * @route   PATCH /api/v1/users/me
 * @access  Private
 */
const updateMe = catchAsync(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  res.status(200).json(sendResponse(true, 'Profile updated successfully', user));
});

module.exports = {
  getMe,
  updateMe,
};
