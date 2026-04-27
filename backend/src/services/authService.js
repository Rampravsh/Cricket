const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const config = require('../config');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const googleClient = new OAuth2Client(config.google.clientId);

/**
 * Verify Google ID token and extract user payload.
 * @param {string} idToken - Google ID token from the frontend
 * @returns {Object} Google user payload { sub, email, name, picture }
 */
const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });
    const payload = ticket.getPayload();
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (error) {
    throw new AppError('Invalid or expired Google token', 401);
  }
};

/**
 * Find or create a user from Google profile data.
 * @param {Object} googleProfile - { sub, email, name, picture }
 * @returns {Object} User document
 */
const findOrCreateUser = async (googleProfile) => {
  let user = await User.findOne({ providerId: googleProfile.sub });

  if (!user) {
    user = await User.create({
      provider: 'google',
      providerId: googleProfile.sub,
      email: googleProfile.email,
      name: googleProfile.name,
      avatar: googleProfile.picture,
    });
  }

  return user;
};

/**
 * Generate a JWT for the application session.
 * @param {Object} user - User document
 * @returns {string} Signed JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

const PlayerProfile = require('../models/PlayerProfile');
const playerProfileService = require('./playerProfileService');

/**
 * Full Google authentication flow:
 * 1. Verify Google token
 * 2. Find or create user
 * 3. Find or create player profile
 * 4. Generate app JWT
 * @param {string} idToken - Google ID token
 * @returns {Object} { token, user, playerProfile }
 */
const authenticateWithGoogle = async (idToken) => {
  const googleProfile = await verifyGoogleToken(idToken);
  const user = await findOrCreateUser(googleProfile);
  const playerProfile = await playerProfileService.getOrCreateProfile(user._id, user.name);
  const token = generateToken(user);
  return { token, user, playerProfile };
};

module.exports = {
  verifyGoogleToken,
  findOrCreateUser,
  generateToken,
  authenticateWithGoogle,
};
