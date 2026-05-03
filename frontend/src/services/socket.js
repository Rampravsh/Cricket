import { io } from 'socket.io-client';
import { ENV } from '~/constants';

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(ENV.SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });
    
    socket.on('connect', () => {
      console.log('[Socket] Connected with ID:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection Error:', error);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinMatch = (matchId) => {
  if (socket && matchId) {
    socket.emit('join-match', matchId); 
    console.log(`[Socket] Joined match room: ${matchId}`);
  }
};

export const joinUser = (userId) => {
  if (socket && userId) {
    socket.emit('join-user', userId);
    console.log(`[Socket] Joined user room: user:${userId}`);
  }
};

export const listenToScoreUpdates = (callback) => {
  if (!socket) return;
  socket.on('score-updated', callback);
  socket.on('match-started', callback);
  socket.on('toss-updated', callback);
  socket.on('match-deleted', callback);
  socket.on('match-created', callback);
};

export const listenToNotifications = (callback) => {
  if (!socket) return;
  socket.on('notification:new', callback);
};

export const listenToMatchUpdates = (callback) => {
  if (!socket) return;
  socket.on('match:update', callback);
};

export const removeEventListeners = () => {
  if (!socket) return;
  socket.off('score-updated');
  socket.off('match-started');
  socket.off('toss-updated');
  socket.off('match-deleted');
  socket.off('match-created');
  socket.off('notification:new');
  socket.off('match:update');
};
