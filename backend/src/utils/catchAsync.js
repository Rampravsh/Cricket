/**
 * Async error wrapper to catch unhandled promise rejections in routes
 * and pass them to the global error handler middleware.
 * @param {Function} fn - The async route handler function
 * @returns {Function} Express middleware function
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = catchAsync;
