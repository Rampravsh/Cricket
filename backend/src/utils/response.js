/**
 * Standard API response formatter
 * @param {boolean} success - Whether the request was successful
 * @param {string} message - A descriptive message
 * @param {any} [data=null] - The payload to send
 * @returns {Object} Formatted response object
 */
const sendResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data,
  };
};

module.exports = { sendResponse };
