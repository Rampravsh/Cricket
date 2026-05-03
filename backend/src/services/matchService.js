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

    const { 
      runs = 0, 
      extra = null, 
      extraRuns = 0,
      wicket = false, 
      wicketType = null,
      fielderId = null,
      strikerId, 
      bowlerId 
    } = ballData;

    // Capture IDs before potential modifications
    const currentStrikerId = strikerId || match.current.strikerId;
    const currentBowlerId = bowlerId || match.current.bowlerId;

    if (!currentStrikerId || !currentBowlerId) {
       throw new AppError('Striker or Bowler ID missing', 400);
    }

    const isLegalDelivery = extra !== 'wide' && extra !== 'noBall';

    // 2. Update score
    if (extra === 'wide' || extra === 'noBall') {
      // 1 penalty run + any additional runs (e.g., wide + 4 byes)
      match.score.runs += 1 + runs + extraRuns;
    } else {
      // Normal runs or byes/leg-byes
      match.score.runs += runs + extraRuns;
    }

    // 3. Handle wicket
    if (wicket) {
      match.score.wickets += 1;
      // Striker is out unless it's a run out of the non-striker
      // For now, assume striker is out
      match.current.strikerId = null;
      
      if (match.score.wickets >= (match.maxPlayers || 11) - 1) {
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
      
      // Check if match completed by overs
      if (match.score.overs >= (match.overs || 20)) {
        match.status = 'completed';
      }
    }

    // 5. Handle strike rotation
    if (!wicket || (wicket && wicketType === 'runOut')) {
      let rotateStrike = false;
      // Normal runs rotate strike if odd
      if (runs % 2 !== 0) {
        rotateStrike = true;
      }

      if (overCompleted) {
        rotateStrike = !rotateStrike;
      }

      if (rotateStrike && match.current.nonStrikerId) {
        const tempId = match.current.strikerId;
        match.current.strikerId = match.current.nonStrikerId;
        match.current.nonStrikerId = tempId;
      }
    } else {
      // If over completes on a wicket, the non-striker becomes the striker for the next over
      if (overCompleted && match.current.nonStrikerId) {
         match.current.strikerId = match.current.nonStrikerId;
         match.current.nonStrikerId = null;
      }
    }

    // 6. Push ball record
    const ballRecord = {
      over: currentOver,
      ball: recordedBallIndex,
      strikerId: currentStrikerId,
      bowlerId: currentBowlerId,
      runs,
      extra,
      extraRuns,
      wicket,
      wicketType,
      fielderId,
      ts: Date.now(),
    };

    match.balls.push(ballRecord);

    // 7. Update currentOver array for real-time display
    if (!match.currentOver) {
      match.currentOver = [];
    }

    let ballText = String(runs);
    if (wicket) ballText = 'W';
    else if (extra === 'wide') ballText = runs > 0 ? `${runs}wd` : 'WD';
    else if (extra === 'noBall') ballText = runs > 0 ? `${runs}nb` : 'NB';
    
    match.currentOver.push(ballText);

    if (overCompleted) {
      match.currentOver = [];
    }

    // 8. Increment lastEventId
    match.lastEventId = (match.lastEventId || 0) + 1;
    ballRecord.eventId = match.lastEventId;

    return match;
  },

  /**
   * Compute roles for a user in a match
   * @param {Object} match - Match document
   * @param {string} userId - User ID
   * @param {string} playerProfileId - Player Profile ID
   * @returns {string[]} Array of roles
   */
  computeUserRoles: (match, userId, playerProfileId) => {
    const roles = [];
    if (!match) return roles;

    if (match.createdByUserId && match.createdByUserId.toString() === userId.toString()) {
      roles.push('creator');
    }

    if (match.scorers && match.scorers.some(id => id.toString() === userId.toString())) {
      roles.push('scorer');
    }

    const isPlayer = match.teams && match.teams.some(team =>
      team.players && team.players.some(p => p.playerId && p.playerId.toString() === playerProfileId?.toString())
    );

    if (isPlayer) {
      roles.push('player');
    }

    return roles;
  },

  /**
   * Finalize match: calculate stats and update profiles
   * @param {Object} match Mongoose Match document
   */
  finalizeMatch: async (match) => {
    // Task 2: Idempotency check
    if (match.status !== 'completed' || match.finalizedAt) return;

    const PlayerProfile = require('../models/PlayerProfile');
    const Performance = require('../models/Performance');
    const activityService = require('./activityService');
    const notificationService = require('../modules/notification/notification.service');

    const players = [];
    match.teams.forEach(team => {
      team.players.forEach(p => {
        players.push(p.playerId.toString());
      });
    });

    for (const playerId of players) {
      // Calculate performance from balls array
      const battingBalls = match.balls.filter(b => b.strikerId && b.strikerId.toString() === playerId && b.extra !== 'wide');
      const runs = battingBalls.reduce((sum, b) => sum + (b.runs || 0), 0);
      const balls = battingBalls.length;
      const fours = battingBalls.filter(b => b.runs === 4).length;
      const sixes = battingBalls.filter(b => b.runs === 6).length;

      const bowlingBalls = match.balls.filter(b => b.bowlerId && b.bowlerId.toString() === playerId);
      const wickets = bowlingBalls.filter(b => b.wicket).length;
      const runsGiven = bowlingBalls.reduce((sum, b) => sum + (b.runs || 0) + (b.extra === 'wide' || b.extra === 'noBall' ? 1 : 0), 0);
      const legalBowledBalls = bowlingBalls.filter(b => b.extra !== 'wide' && b.extra !== 'noBall').length;
      const overs = Math.floor(legalBowledBalls / 6) + (legalBowledBalls % 6) / 10;

      // 1. Create Performance (Source of Truth)
      await Performance.findOneAndUpdate(
        { matchId: match._id, playerId },
        {
          batting: { runs, balls, fours, sixes },
          bowling: { wickets, runsGiven, overs }
        },
        { upsert: true, new: true }
      );

      // 2. Update PlayerProfile stats (Cache)
      const profile = await PlayerProfile.findById(playerId);
      if (profile) {
        profile.stats.totalRuns += runs;
        profile.stats.totalWickets += wickets;
        profile.stats.matchesPlayed += 1;

        // Task 5: Achievements Generation
        if (runs >= 100) {
          profile.achievements.push({
            title: 'Century!',
            description: `Scored ${runs} runs in match ${match.matchId}`,
            matchId: match._id
          });
        } else if (runs >= 50) {
          profile.achievements.push({
            title: 'Half Century!',
            description: `Scored ${runs} runs in match ${match.matchId}`,
            matchId: match._id
          });
        }

        if (wickets >= 5) {
          profile.achievements.push({
            title: 'Five-wicket Haul!',
            description: `Took ${wickets} wickets in match ${match.matchId}`,
            matchId: match._id
          });
        }

        await profile.save();

        // 3. Create Activity
        await activityService.createActivity(profile.userId, 'match_played', match._id, { runs, wickets });
        if (runs >= 50) {
          await activityService.createActivity(profile.userId, 'fifty', match._id, { runs });
        }
        if (wickets >= 3) {
          await activityService.createActivity(profile.userId, 'wicket', match._id, { wickets });
        }

        // 4. Create Notification
        await notificationService.sendNotification({
          userId: profile.userId,
          type: 'info',
          title: 'Match Finalized',
          message: `Match ${match.matchId} has been finalized. Your stats: ${runs} runs, ${wickets} wickets.`,
          matchId: match._id,
          meta: { matchId: match.matchId, runs, wickets }
        });
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

    // 5. Set finalizedAt
    match.finalizedAt = new Date();
    await match.save();
  },

  /**
   * Recompute player stats from all Performance records
   * Task 3: Stats Source of Truth Fallback
   */
  recomputePlayerStats: async (playerProfileId) => {
    const Performance = require('../models/Performance');
    const PlayerProfile = require('../models/PlayerProfile');

    const performances = await Performance.find({ playerId: playerProfileId });

    const stats = {
      totalRuns: 0,
      totalWickets: 0,
      matchesPlayed: performances.length,
      matchesCreated: 0,
      matchesScored: 0
    };

    performances.forEach(p => {
      stats.totalRuns += p.batting.runs || 0;
      stats.totalWickets += p.bowling.wickets || 0;
    });

    const profile = await PlayerProfile.findById(playerProfileId);
    if (profile) {
      // Preserve created/scored counts as they aren't in Performance
      stats.matchesCreated = profile.stats.matchesCreated;
      stats.matchesScored = profile.stats.matchesScored;

      profile.stats = stats;
      await profile.save();
    }

    return stats;
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
  },

  /**
   * Calculate detailed scorecard from balls array
   */
  calculateScorecard: (match) => {
    const scorecard = {
      batting: {}, // playerId -> { runs, balls, sixes, fours, status, dismissedBy, fielder }
      bowling: {}, // playerId -> { runs, balls, wickets, maidens, dots }
      extras: { wide: 0, noBall: 0, bye: 0, legBye: 0, total: 0 }
    };

    if (!match.balls) return scorecard;

    match.balls.forEach(ball => {
      const { strikerId, bowlerId, runs, extra, wicket, wicketType, fielderId } = ball;

      // 1. Batting Stats
      if (!scorecard.batting[strikerId]) {
        scorecard.batting[strikerId] = { runs: 0, balls: 0, sixes: 0, fours: 0, status: 'not out' };
      }
      
      const isLegal = extra !== 'wide';
      if (isLegal) {
        scorecard.batting[strikerId].balls += 1;
        scorecard.batting[strikerId].runs += runs;
        if (runs === 4) scorecard.batting[strikerId].fours += 1;
        if (runs === 6) scorecard.batting[strikerId].sixes += 1;
      }

      if (wicket) {
        scorecard.batting[strikerId].status = wicketType || 'out';
        scorecard.batting[strikerId].dismissedBy = bowlerId;
        scorecard.batting[strikerId].fielder = fielderId;
      }

      // 2. Bowling Stats
      if (!scorecard.bowling[bowlerId]) {
        scorecard.bowling[bowlerId] = { runs: 0, balls: 0, wickets: 0, maidens: 0, dots: 0 };
      }
      
      if (isLegal) {
        scorecard.bowling[bowlerId].balls += 1;
      }
      
      // Runs conceded by bowler (wide and no-ball runs count, but byes/leg-byes don't)
      const isExtraConceded = extra === 'wide' || extra === 'noBall';
      const penalty = isExtraConceded ? 1 : 0;
      if (extra !== 'bye' && extra !== 'legBye') {
        scorecard.bowling[bowlerId].runs += penalty + runs;
      }

      if (wicket && wicketType !== 'runOut' && wicketType !== 'retired') {
        scorecard.bowling[bowlerId].wickets += 1;
      }
      
      if (runs === 0 && !isExtraConceded) {
        scorecard.bowling[bowlerId].dots += 1;
      }

      // 3. Extras
      if (extra) {
        scorecard.extras[extra] = (scorecard.extras[extra] || 0) + 1;
        scorecard.extras.total += 1;
      }
    });

    return scorecard;
  },

  /**
   * Enrich match object with human-readable names for current players
   */
  enrichMatchWithNames: (match) => {
    const matchObj = match.toObject ? match.toObject() : match;
    const playerMap = new Map();
    
    // Create a map of all players in both teams
    match.teams.forEach(team => {
      team.players.forEach(p => {
        playerMap.set(p.playerId?.toString() || p.nameSnapshot, p.playerId?.displayName || p.nameSnapshot);
      });
    });

    if (matchObj.current) {
      matchObj.current.strikerName = playerMap.get(matchObj.current.strikerId) || 'Striker';
      matchObj.current.nonStrikerName = playerMap.get(matchObj.current.nonStrikerId) || 'Non-Striker';
      matchObj.current.bowlerName = playerMap.get(matchObj.current.bowlerId) || 'Bowler';
    }

    matchObj.scorecard = matchService.calculateScorecard(match);
    
    // Map scorecard IDs to names for easier display
    const enrichedBatting = {};
    Object.keys(matchObj.scorecard.batting).forEach(id => {
      const name = playerMap.get(id) || id;
      enrichedBatting[id] = { ...matchObj.scorecard.batting[id], name };
    });
    matchObj.scorecard.batting = enrichedBatting;

    return matchObj;
  }
};

module.exports = matchService;
