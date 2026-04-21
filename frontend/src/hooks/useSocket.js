import { useEffect, useRef, useState, useCallback } from 'react';
import { ENV } from '~/constants';

/**
 * useSocket — placeholder hook for WebSocket / Socket.IO connection
 *
 * This hook manages the socket lifecycle:
 *   - Connect on mount (or when `enabled` becomes true)
 *   - Disconnect on unmount
 *   - Expose send function and connection status
 *
 * TODO: Replace the placeholder WebSocket with Socket.IO client once
 *       the backend is ready:
 *
 *   import { io } from 'socket.io-client';
 *   const socket = io(ENV.SOCKET_URL, { transports: ['websocket'] });
 *
 * @param {object} options
 * @param {boolean} options.enabled     - Connect when true (default: true)
 * @param {string}  options.room        - Room/channel to join on connect
 * @param {function} options.onMessage  - Callback for incoming messages
 * @returns {{ isConnected, send, disconnect, reconnect }}
 */
function useSocket({ enabled = false, room = null, onMessage = null } = {}) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Connect
  const connect = useCallback(() => {
    if (socketRef.current) return; // already connected

    try {
      // ── PLACEHOLDER: replace with Socket.IO when backend is ready ──
      // const socket = io(ENV.SOCKET_URL, {
      //   transports: ['websocket'],
      //   query: { room },
      // });

      // Simulate connection for UI development
      console.log(`[useSocket] Connecting to ${ENV.SOCKET_URL}...`);

      // Placeholder: simulate successful connection after 500ms
      const timer = setTimeout(() => {
        setIsConnected(true);
        console.log('[useSocket] Connected (placeholder)');
      }, 500);

      // Store timer as "socket" placeholder for cleanup
      socketRef.current = { _placeholderTimer: timer };
      setError(null);
    } catch (err) {
      console.error('[useSocket] Connection error:', err);
      setError(err.message);
    }
  }, [room]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (!socketRef.current) return;

    // ── PLACEHOLDER cleanup ──
    if (socketRef.current._placeholderTimer) {
      clearTimeout(socketRef.current._placeholderTimer);
    }

    // Real cleanup: socketRef.current.disconnect();
    socketRef.current = null;
    setIsConnected(false);
    console.log('[useSocket] Disconnected');
  }, []);

  // Reconnect
  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [connect, disconnect]);

  // Send a message
  const send = useCallback(
    (event, data) => {
      if (!isConnected || !socketRef.current) {
        console.warn('[useSocket] Cannot send — not connected');
        return;
      }
      // Real: socketRef.current.emit(event, data);
      console.log(`[useSocket] send (placeholder): ${event}`, data);
    },
    [isConnected]
  );

  // Lifecycle
  useEffect(() => {
    if (enabled) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    error,
    send,
    disconnect,
    reconnect,
  };
}

export default useSocket;
