/**
 * Simple console-based logger
 */

const getTimestamp = () => new Date().toISOString();

const logger = {
  info: (message, meta = '') => {
    console.log(`[${getTimestamp()}] [INFO]: ${message}`, meta);
  },
  warn: (message, meta = '') => {
    console.warn(`[${getTimestamp()}] [WARN]: ${message}`, meta);
  },
  error: (message, meta = '') => {
    console.error(`[${getTimestamp()}] [ERROR]: ${message}`, meta);
  },
  debug: (message, meta = '') => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${getTimestamp()}] [DEBUG]: ${message}`, meta);
    }
  },
};

module.exports = logger;
