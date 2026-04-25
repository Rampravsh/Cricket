const { sendResponse } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const authService = require('../services/authService');

/**
 * @desc    Authenticate user via Google ID token
 * @route   POST /api/v1/auth/google
 * @access  Public
 */
const googleLogin = catchAsync(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json(sendResponse(false, 'Google ID token is required'));
  }

  const { token, user } = await authService.authenticateWithGoogle(idToken);

  res.status(200).json(sendResponse(true, 'Authentication successful', { token, user }));
});

module.exports = {
  googleLogin,
};
