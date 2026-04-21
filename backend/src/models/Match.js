const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    matchId: {
      type: String,
      required: [true, 'Match ID is required'],
      unique: true,
      trim: true,
    },
    teams: {
      type: [String],
      required: true,
      validate: [
        (val) => val.length === 2,
        '{PATH} must contain exactly 2 teams',
      ],
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'abandoned'],
      default: 'scheduled',
    },
    schemaVersion: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  }
);

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
