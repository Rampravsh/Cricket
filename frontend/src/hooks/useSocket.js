import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { connectSocket, disconnectSocket, joinMatch, listenToScoreUpdates, removeEventListeners } from '~/services/socket';
import { setMatchFromSocket } from '~/store/matchSlice';

/**
 * useSocket — hook for Socket.IO connection handling
 *
 * @param {string} matchId  - ID of the match to join
 */
function useSocket(matchId) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!matchId) return;

    // Connect and join match room
    const socket = connectSocket();
    joinMatch(matchId);

    // Listen to updates from socket
    const handleUpdate = (data) => {
      // The socket sends the updated match document
      dispatch(setMatchFromSocket(data));
    };

    listenToScoreUpdates(handleUpdate);

    // Cleanup on unmount or when matchId changes
    return () => {
      removeEventListeners();
      disconnectSocket();
    };
  }, [matchId, dispatch]);
}

export default useSocket;
