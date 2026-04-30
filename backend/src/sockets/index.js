const logger = require('../utils/logger');

let ioInstance = null;
const userSockets = new Map(); // userId -> Set(socketId)

const socketHandler = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // Join a specific match room
    socket.on('join-match', (matchId) => {
      socket.join(matchId);
      logger.info(`Socket ${socket.id} joined room: ${matchId}`);
      socket.emit('room-joined', { matchId });
    });

    // Join a private user room for notifications
    socket.on('join-user', (userId) => {
      // User joins room: user:{userId}
      const room = `user:${userId}`;
      socket.join(room);
      
      // Maintain mapping
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);
      
      // Store userId on socket for cleanup
      socket.userId = userId;

      logger.info(`Socket ${socket.id} joined user room: ${room}`);
    });

    // Handle generic score updates
    socket.on('update-score', (data) => {
      const { matchId, scoreData } = data;
      socket.to(matchId).emit('score-update', scoreData);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
      if (socket.userId && userSockets.has(socket.userId)) {
        userSockets.get(socket.userId).delete(socket.id);
        if (userSockets.get(socket.userId).size === 0) {
          userSockets.delete(socket.userId);
        }
      }
    });
  });
};

const getIO = () => ioInstance;
const getUserSockets = (userId) => userSockets.get(userId) || new Set();

module.exports = {
  socketHandler,
  getIO,
  getUserSockets
};
