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
 * @access  Public
 */
const createMatch = catchAsync(async (req, res) => {
  const deviceId = req.headers['x-device-id'];
  if (!deviceId) {
    return res.status(400).json(sendResponse(false, 'Device ID is required in headers (x-device-id)'));
  }

  const { matchId, teams, isPublic, toss } = req.body;

  const newMatch = await Match.create({
    matchId,
    teams,
    isPublic,
    toss,
    hostId: deviceId,
    activeScorer: deviceId,
    scorers: [deviceId],
    status: 'waiting', // or 'live' based on your start logic
  });

  const io = req.app.get('io');
  if (io) {
    io.to(newMatch.matchId).emit('match-created', newMatch);
  }

  res.status(201).json(sendResponse(true, 'Match created successfully', newMatch));
});

/**
 * @desc    Get a single match by ID
 * @route   GET /api/v1/matches/:matchId
 * @access  Public
 */
const getMatchById = catchAsync(async (req, res) => {
  const { matchId } = req.params;
  const match = await Match.findOne({ matchId });

  if (!match) {
    return res.status(404).json(sendResponse(false, 'Match not found'));
  }

  res.status(200).json(sendResponse(true, 'Match fetched successfully', match));
});

/**
 * @desc    Process a new ball
 * @route   POST /api/v1/matches/:matchId/ball
 * @access  Public
 */
const addBall = catchAsync(async (req, res) => {
  const { matchId } = req.params;
  const deviceId = req.headers['x-device-id'];

  if (!deviceId) {
    return res.status(400).json(sendResponse(false, 'Device ID is required in headers (x-device-id)'));
  }

  const match = await Match.findOne({ matchId });

  if (!match) {
    return res.status(404).json(sendResponse(false, 'Match not found'));
  }

  if (match.status !== 'live') {
    return res.status(400).json(sendResponse(false, 'Match not live'));
  }

  if (deviceId !== match.activeScorer) {
    return res.status(403).json(sendResponse(false, 'Not authorized'));
  }

  const ballData = req.body;

  // Process ball in service layer
  const updatedMatch = matchService.processBall(match, ballData);

  // 1. Process ball
  // 2. Save match
  // 3. Emit event (Strict order as requested)
  await updatedMatch.save();

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
  getMatchById,
  addBall,
  getPublicMatches,
};
