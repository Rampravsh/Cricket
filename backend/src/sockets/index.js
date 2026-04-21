const logger = require('../utils/logger');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // Join a specific match room
    socket.on('join-match', (matchId) => {
      socket.join(matchId);
      logger.info(`Socket ${socket.id} joined room: ${matchId}`);
      // Acknowledge the join
      socket.emit('room-joined', { matchId });
    });

    // Handle generic score updates emitted by client
    // In a real app, this might only be allowed by admins/scorers
    socket.on('update-score', (data) => {
      const { matchId, scoreData } = data;
      // Broadcast to everyone else in the match room
      socket.to(matchId).emit('score-update', scoreData);
      logger.debug(`Score updated for match ${matchId}:`, scoreData);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
