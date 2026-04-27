const mongoose = require('mongoose');

const playerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['batsman', 'bowler', 'allrounder'],
      default: 'allrounder',
    },
    stats: {
      totalRuns: { type: Number, default: 0 },
      totalWickets: { type: Number, default: 0 },
      matchesPlayed: { type: Number, default: 0 },
      matchesCreated: { type: Number, default: 0 },
      matchesScored: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const PlayerProfile = mongoose.model('PlayerProfile', playerProfileSchema);

module.exports = PlayerProfile;
