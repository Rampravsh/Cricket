const logger = require('../utils/logger');
const { sendResponse } = require('../utils/response');
const config = require('../config');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log error using custom logger
  logger.error(err.message, { stack: err.stack, name: err.name });

  // Handle specific Mongoose errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id of ${err.value}`;
  }

  // Hide detailed errors in production
  if (config.env === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
  }

  res.status(statusCode).json(sendResponse(false, message, config.env === 'development' ? { stack: err.stack } : null));
};

module.exports = errorHandler;
