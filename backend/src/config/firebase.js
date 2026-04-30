const admin = require('firebase-admin');
const path = require('path');
const logger = require('../utils/logger');

const serviceAccountPath = path.join(__dirname, '../../cricket-494410-firebase-adminsdk-fbsvc-f4a7379d18.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
  });
  logger.info('Firebase Admin initialized successfully');
} catch (error) {
  logger.error('Error initializing Firebase Admin:', error);
}

module.exports = admin;
