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
};

module.exports = matchService;
