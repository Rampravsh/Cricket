const jwt = require('jsonwebtoken');

const config = require('../config');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * JWT Authentication Middleware.
 * Verifies the Bearer token from the Authorization header
 * and attaches the user document to req.user.
 */
const protect = catchAsync(async (req, res, next) => {
  // 1) Extract token from Authorization header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authenticated. Please log in.', 401);
  }

  // 2) Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.secret);
  } catch (err) {
    throw new AppError('Invalid or expired token', 401);
  }

  // 3) Check if user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }

  // 4) Attach user to request
  req.user = user;
  next();
});

module.exports = { protect };
