const Match = require('../models/Match');
const { sendResponse } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware to check if the user has permission to score the match.
 * Allow scoring if:
 * - User is the creator (createdByUserId)
 * - User is in the scorers array
 */
const canScoreMatch = catchAsync(async (req, res, next) => {
  const matchId = req.params.matchId || req.params.id;
  const match = await Match.findOne({ matchId });

  if (!match) {
    return res.status(404).json(sendResponse(false, 'Match not found'));
  }

  const userId = req.user._id.toString();
  const isCreator = match.createdByUserId.toString() === userId;
  const isScorer = match.scorers.some(id => id.toString() === userId);

  if (!isCreator && !isScorer) {
    return res.status(403).json(sendResponse(false, 'Not authorized to score this match'));
  }

  req.match = match; // Attach match to request for further use
  next();
});

module.exports = {
  canScoreMatch,
};
