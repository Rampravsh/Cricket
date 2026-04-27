const { sendResponse } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const Match = require('../models/Match');
const matchService = require('../services/matchService');

/**
 * @desc    Health check route
 * @route   GET /api/v1/health
 * @access  Public
 */
const checkHealth = catchAsync(async (req, res) => {
  res.status(200).json(
    sendResponse(true, 'Server is healthy', {
      uptime: process.uptime(),
      timestamp: Date.now(),
    })
  );
});

/**
 * @desc    Create a new match
 * @route   POST /api/v1/matches/create
 * @access  Private
 */
const createMatch = catchAsync(async (req, res) => {
  const { matchId, teams, isPublic, toss } = req.body;

  const newMatch = await Match.create({
    matchId,
    teams,
    isPublic,
    toss,
    createdByUserId: req.user._id,
    activeScorer: req.user._id,
    scorers: [req.user._id],
    status: 'waiting',
  });

  const io = req.app.get('io');
  if (io) {
    io.to(newMatch.matchId).emit('match-created', newMatch);
  }

  res.status(201).json(sendResponse(true, 'Match created successfully', newMatch));
});

/**
 * @desc    Get current user's match history
 * @route   GET /api/v1/users/me/matches
 * @access  Private
 */
const getMyMatches = catchAsync(async (req, res) => {
  const PlayerProfile = require('../models/PlayerProfile');
  const playerProfile = await PlayerProfile.findOne({ userId: req.user._id });
  const matches = await matchService.getMatchHistory(req.user._id, playerProfile?._id);
  
  // Task 4: Include roles
  const matchesWithRoles = matches.map(match => {
    const matchObj = match.toObject();
    matchObj.roles = matchService.computeUserRoles(match, req.user._id, playerProfile?._id);
    return matchObj;
  });

  res.status(200).json(sendResponse(true, 'Match history fetched successfully', matchesWithRoles));
});

/**
 * @desc    Get a single match by ID
 * @route   GET /api/v1/matches/:matchId
 * @access  Public
 */
const getMatchById = catchAsync(async (req, res) => {
  const { matchId } = req.params;
  const match = await Match.findOne({ matchId })
    .populate('createdByUserId', 'name avatar')
    .populate('scorers', 'name avatar')
    .populate('teams.players.playerId');

  if (!match) {
    return res.status(404).json(sendResponse(false, 'Match not found'));
  }

  // Task 4: Include roles if user is authenticated
  const matchObj = match.toObject();
  if (req.user) {
    const PlayerProfile = require('../models/PlayerProfile');
    const playerProfile = await PlayerProfile.findOne({ userId: req.user._id });
    matchObj.roles = matchService.computeUserRoles(match, req.user._id, playerProfile?._id);
  }

  res.status(200).json(sendResponse(true, 'Match fetched successfully', matchObj));
});

/**
 * @desc    Start a match
 * @route   PATCH /api/v1/matches/:matchId/start
 * @access  Private
 */
const startMatch = catchAsync(async (req, res) => {
  const { matchId } = req.params;
  const match = await Match.findOne({ matchId });

  if (!match) {
    return res.status(404).json(sendResponse(false, 'Match not found'));
  }

  if (match.status === 'live') {
    return res.status(400).json(sendResponse(false, 'Match is already live'));
  }

  // Authorization check
  if (!match.createdByUserId.equals(req.user._id) && !match.scorers.includes(req.user._id)) {
    return res.status(403).json(sendResponse(false, 'Not authorized to start this match'));
  }

  if (!match.teams || match.teams.length < 2) {
    return res.status(400).json(sendResponse(false, 'Both teams must exist to start the match'));
  }

  let battingTeam = match.teams[0];
  let bowlingTeam = match.teams[1];

  if (match.toss && match.toss.winner && match.toss.decision) {
    const isWinnerBatting = match.toss.decision === 'bat';
    if (match.teams[0].name === match.toss.winner) {
      battingTeam = isWinnerBatting ? match.teams[0] : match.teams[1];
      bowlingTeam = isWinnerBatting ? match.teams[1] : match.teams[0];
    } else if (match.teams[1].name === match.toss.winner) {
      battingTeam = isWinnerBatting ? match.teams[1] : match.teams[0];
      bowlingTeam = isWinnerBatting ? match.teams[0] : match.teams[1];
    }
  }

  if (!battingTeam.players || battingTeam.players.length < 2) {
    return res.status(400).json(sendResponse(false, 'Batting team must have at least 2 players'));
  }

  if (!bowlingTeam.players || bowlingTeam.players.length < 1) {
    return res.status(400).json(sendResponse(false, 'Bowling team must have at least 1 player'));
  }

  match.status = 'live';
  match.current = {
    strikerId: battingTeam.players[0].playerId,
    nonStrikerId: battingTeam.players[1].playerId,
    bowlerId: bowlingTeam.players[0].playerId,
  };

  await match.save();

  const io = req.app.get('io');
  if (io) {
    io.to(match.matchId).emit('match-started', match);
  }

  res.status(200).json(sendResponse(true, 'Match started', match));
});

/**
 * @desc    Process a new ball
 * @route   POST /api/v1/matches/:matchId/ball
 * @access  Private
 */
const addBall = catchAsync(async (req, res) => {
  const { matchId } = req.params;
  const match = await Match.findOne({ matchId });

  if (!match) {
    return res.status(404).json(sendResponse(false, 'Match not found'));
  }

  if (match.status !== 'live') {
    return res.status(400).json(sendResponse(false, 'Match not live'));
  }

  if (!match.activeScorer.equals(req.user._id)) {
    return res.status(403).json(sendResponse(false, 'Not authorized to score this match'));
  }

  const ballData = req.body;
  const updatedMatch = matchService.processBall(match, ballData);

  await updatedMatch.save();

  // If match completed, finalize stats
  if (updatedMatch.status === 'completed') {
    await matchService.finalizeMatch(updatedMatch);
  }

  const io = req.app.get('io');
  if (io) {
    io.to(updatedMatch.matchId).emit('score-updated', updatedMatch);
  }

  res.status(200).json(sendResponse(true, 'Ball added successfully', updatedMatch));
});

/**
 * @desc    Get public matches
 * @route   GET /api/v1/matches/public
 * @access  Public
 */
const getPublicMatches = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const matches = await Match.find({ isPublic: true })
    .populate('createdByUserId', 'name avatar')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Match.countDocuments({ isPublic: true });

  res.status(200).json(sendResponse(true, 'Public matches fetched successfully', {
    matches,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }));
});

module.exports = {
  checkHealth,
  createMatch,
  getMyMatches,
  getMatchById,
  startMatch,
  addBall,
  getPublicMatches,
};
