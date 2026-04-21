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
    if (!match || match.status !== 'live') {
      throw new AppError('Match is not live or does not exist', 400);
    }

    const { runs = 0, extra = null, wicket = false, strikerId, bowlerId } = ballData;

    // 1. Increment team score
    match.score.runs += runs;

    // 1a. Handle extras (wides/no balls usually add to team score but might not count as a formal ball)
    // For simplicity, we just add run value directly assuming `runs` includes the extras value.
    if (extra) {
      // In professional cricket wide/noBall add 1 run padding + runs off bat. Use passed runs.
    }

    // 2. Handle wicket
    if (wicket) {
      match.score.wickets += 1;
    }

    // 3. Handle ball count
    // A wide or noBall usually doesn't count as a legal delivery, but keeping it simple as requested or we can handle it:
    let isLegalDelivery = (extra !== 'wide' && extra !== 'noBall');
    
    if (isLegalDelivery) {
      match.score.balls += 1;

      if (match.score.balls === 6) {
        match.score.overs += 1;
        match.score.balls = 0;
      }
    }

    // 4. Determine new ball ID/sequence
    const newOver = match.score.overs;
    const newBall = match.score.balls;

    // 5. Push ball object to match.balls
    const ballRecord = {
      over: newOver,
      ball: newBall,
      strikerId: strikerId || match.current.strikerId,
      bowlerId: bowlerId || match.current.bowlerId,
      runs,
      extra,
      wicket,
      ts: Date.now(),
    };

    match.balls.push(ballRecord);

    // 6. Basic strike change logic (rotate if runs are odd)
    let rotateStrike = false;
    if (runs % 2 !== 0) {
      rotateStrike = !rotateStrike;
    }
    
    // Rotate strike at the end of the over
    if (isLegalDelivery && match.score.balls === 0) {
       rotateStrike = !rotateStrike;
    }

    if (rotateStrike) {
      const tempId = match.current.strikerId;
      match.current.strikerId = match.current.nonStrikerId;
      match.current.nonStrikerId = tempId;
    }
    
    // 7. Update lastEventId
    match.lastEventId += 1;

    return match;
  },
};

module.exports = matchService;
