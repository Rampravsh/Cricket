/**
 * Utility helper functions for the Cricket app
 */

/**
 * Format a number to always show 2 digits (e.g., 5 → "05")
 * @param {number} num
 * @returns {string}
 */
export const padNumber = (num) => String(num).padStart(2, '0');

/**
 * Format overs display (e.g., 12.3 → "12.3 Ov")
 * @param {number} balls - total balls bowled
 * @returns {string}
 */
export const formatOvers = (balls) => {
  const overs = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return `${overs}.${remainingBalls} Ov`;
};

/**
 * Calculate run rate
 * @param {number} runs
 * @param {number} balls
 * @returns {string} formatted run rate
 */
export const calculateRunRate = (runs, balls) => {
  if (balls === 0) return '0.00';
  const overs = balls / 6;
  return (runs / overs).toFixed(2);
};

/**
 * Calculate required run rate
 * @param {number} target
 * @param {number} currentRuns
 * @param {number} ballsRemaining
 * @returns {string}
 */
export const calculateRequiredRunRate = (target, currentRuns, ballsRemaining) => {
  if (ballsRemaining <= 0) return '0.00';
  const runsNeeded = target - currentRuns;
  const oversRemaining = ballsRemaining / 6;
  return (runsNeeded / oversRemaining).toFixed(2);
};

/**
 * Get match result string
 * @param {object} match
 * @returns {string}
 */
export const getMatchResult = (match) => {
  if (!match || !match.result) return '';
  return match.result;
};

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 20) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Check if a delivery is a legal ball (not wide/no-ball)
 * @param {string|number} delivery
 * @returns {boolean}
 */
export const isLegalDelivery = (delivery) => {
  return delivery !== 'WD' && delivery !== 'NB';
};
