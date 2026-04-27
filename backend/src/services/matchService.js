const AppError = require('../utils/AppError');

/**
 * Service to handle match logic
 */
const matchService = {
  /**
   * Process a new ball event
   * @param {Object} match Mongoose Match document
   * @param {Object} ballData Data for the new ball
   * @returns {Object} updated match object
   */
  processBall: (match, ballData) => {
    // 1. Validate match
    if (!match || match.status !== 'live') {
      throw new AppError('Match is not live or does not exist', 400);
    }

    const { runs = 0, extra = null, wicket = false, strikerId, bowlerId } = ballData;

    // Capture IDs before potential modifications
    const currentStrikerId = strikerId || match.current.strikerId;
    const currentBowlerId = bowlerId || match.current.bowlerId;

    const isLegalDelivery = extra !== 'wide' && extra !== 'noBall';

    // 2. Update score
    if (!isLegalDelivery) {
      match.score.runs += 1 + runs;
    } else {
      match.score.runs += runs;
    }

    // 3. Handle wicket
    if (wicket) {
      match.score.wickets += 1;
      match.current.strikerId = null;
      if (match.score.wickets >= 10) {
        match.status = 'completed';
      }
    }

    // 4. Update balls & overs
    const recordedBallIndex = match.score.balls; // current legal balls (0-5)
    
    if (isLegalDelivery) {
      match.score.balls += 1;
    }

    const currentOver = match.score.overs;

    let overCompleted = false;
    if (match.score.balls === 6) {
      match.score.overs += 1;
      match.score.balls = 0;
      overCompleted = true;
    }

    // 5. Handle strike rotation
    let rotateStrike = false;
    if (runs % 2 !== 0) {
      rotateStrike = true;
    }
    
    if (overCompleted) {
      rotateStrike = !rotateStrike;
    }

    if (rotateStrike) {
      const tempId = match.current.strikerId;
      match.current.strikerId = match.current.nonStrikerId;
      match.current.nonStrikerId = tempId;
    }

    // 6. Push ball record
    const ballRecord = {
      over: currentOver,
      ball: recordedBallIndex,
      strikerId: currentStrikerId,
      bowlerId: currentBowlerId,
      runs,
      extra,
      wicket,
      ts: Date.now(),
    };
    
    match.balls.push(ballRecord);

    // 7. Update currentOver array
    if (!match.currentOver) {
      match.currentOver = [];
    }
    
    if (wicket) {
      match.currentOver.push('W');
    } else if (extra) {
      match.currentOver.push(extra);
    } else {
      match.currentOver.push(runs);
    }

    if (overCompleted) {
      match.currentOver = [];
    }

    // 8. Increment lastEventId
    match.lastEventId = (match.lastEventId || 0) + 1;
    ballRecord.eventId = match.lastEventId;

    return match;
  },
  /**
   * Finalize match: calculate stats and update profiles
   * @param {Object} match Mongoose Match document
   */
  finalizeMatch: async (match) => {
    if (match.status !== 'completed') return;

    const PlayerProfile = require('../models/PlayerProfile');
    const Performance = require('../models/Performance');
    const activityService = require('./activityService');

    const players = [];
    match.teams.forEach(team => {
      team.players.forEach(p => {
        players.push(p.playerId.toString());
      });
    });

    for (const playerId of players) {
      // Calculate performance from balls array
      const battingBalls = match.balls.filter(b => b.strikerId === playerId && b.extra !== 'wide');
      const runs = battingBalls.reduce((sum, b) => sum + (b.runs || 0), 0);
      const balls = battingBalls.length;
      const fours = battingBalls.filter(b => b.runs === 4).length;
      const sixes = battingBalls.filter(b => b.runs === 6).length;

      const bowlingBalls = match.balls.filter(b => b.bowlerId === playerId);
      const wickets = bowlingBalls.filter(b => b.wicket).length;
      const runsGiven = bowlingBalls.reduce((sum, b) => sum + (b.runs || 0) + (b.extra === 'wide' || b.extra === 'noBall' ? 1 : 0), 0);
      const legalBowledBalls = bowlingBalls.filter(b => b.extra !== 'wide' && b.extra !== 'noBall').length;
      const overs = Math.floor(legalBowledBalls / 6) + (legalBowledBalls % 6) / 10;

      // Create Performance record
      await Performance.findOneAndUpdate(
        { matchId: match._id, playerId },
        {
          batting: { runs, balls, fours, sixes },
          bowling: { wickets, runsGiven, overs }
        },
        { upsert: true }
      );

      // Update PlayerProfile stats
      const profile = await PlayerProfile.findById(playerId);
      if (profile) {
        profile.stats.totalRuns += runs;
        profile.stats.totalWickets += wickets;
        profile.stats.matchesPlayed += 1;
        await profile.save();

        // Create Activity
        await activityService.createActivity(profile.userId, 'match_played', match._id, { runs, wickets });
        if (runs >= 50) {
          await activityService.createActivity(profile.userId, 'fifty', match._id, { runs });
        }
        if (wickets >= 3) {
          await activityService.createActivity(profile.userId, 'wicket', match._id, { wickets });
        }
      }
    }

    // Update Creator stats
    const creatorProfile = await PlayerProfile.findOne({ userId: match.createdByUserId });
    if (creatorProfile) {
      creatorProfile.stats.matchesCreated += 1;
      await creatorProfile.save();
      await activityService.createActivity(match.createdByUserId, 'match_created', match._id);
    }

    // Update Scorers stats
    if (match.scorers && match.scorers.length > 0) {
      for (const scorerId of match.scorers) {
        const scorerProfile = await PlayerProfile.findOne({ userId: scorerId });
        if (scorerProfile) {
          scorerProfile.stats.matchesScored += 1;
          await scorerProfile.save();
        }
      }
    }
  },

  /**
   * Get match history for a user
   * @param {string} userId - User ID
   * @param {string} playerProfileId - Player Profile ID
   */
  getMatchHistory: async (userId, playerProfileId) => {
    const Match = require('../models/Match');
    return await Match.find({
      $or: [
        { createdByUserId: userId },
        { scorers: userId },
        { 'teams.players.playerId': playerProfileId }
      ]
    }).sort({ createdAt: -1 });
  }
};

module.exports = matchService;
