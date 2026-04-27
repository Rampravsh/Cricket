const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
      index: true,
    },
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlayerProfile',
      required: true,
      index: true,
    },
    batting: {
      runs: { type: Number, default: 0 },
      balls: { type: Number, default: 0 },
      fours: { type: Number, default: 0 },
      sixes: { type: Number, default: 0 },
    },
    bowling: {
      wickets: { type: Number, default: 0 },
      runsGiven: { type: Number, default: 0 },
      overs: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one performance record per player per match
performanceSchema.index({ matchId: 1, playerId: 1 }, { unique: true });

const Performance = mongoose.model('Performance', performanceSchema);

module.exports = Performance;
