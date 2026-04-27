const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['match_played', 'fifty', 'wicket', 'match_created'],
      required: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
