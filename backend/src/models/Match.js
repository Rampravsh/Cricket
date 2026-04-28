const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    matchId: {
      type: String,
      required: [true, 'Match ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'live', 'completed'],
      default: 'waiting',
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    teams: [
      {
        name: { type: String, required: true },
        players: [
          {
            playerId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'PlayerProfile',
              required: false,
            },
            nameSnapshot: { type: String, required: true },
          },
        ],
      },
    ],
    toss: {
      winner: { type: String }, // Id or name of the winning team
      decision: { type: String, enum: ['bat', 'bowl'] },
    },
    current: {
      strikerId: { type: String },
      nonStrikerId: { type: String },
      bowlerId: { type: String },
    },
    score: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      overs: { type: Number, default: 0 },
      balls: { type: Number, default: 0 },
    },
    balls: [
      {
        over: { type: Number, required: true },
        ball: { type: Number, required: true }, // 0-5
        strikerId: { type: String, required: true },
        bowlerId: { type: String, required: true },
        runs: { type: Number, default: 0 },
        extra: { type: String, enum: ['wide', 'noBall', null], default: null },
        wicket: { type: Boolean, default: false },
        ts: { type: Number, default: Date.now },
      },
    ],
    format: {
      type: String,
      enum: ['T10', 'T20', 'ODI', 'custom'],
      default: 'custom',
    },
    overs: {
      type: Number,
      default: 20,
    },
    maxPlayers: {
      type: Number,
      default: 11,
    },
    players: [
      {
        playerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        name: { type: String },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
      },
    ],
    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scorers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    scorerRequests: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
      },
    ],
    activeScorer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    finalizedAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastEventId: { type: Number, default: 0 },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  }
);

// Indexes for performance optimization
matchSchema.index({ createdByUserId: 1 });
matchSchema.index({ scorers: 1 });
matchSchema.index({ 'teams.players.playerId': 1 });

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
