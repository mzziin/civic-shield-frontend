import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  withCredentials: true
});

export const subscribeToUpdates = (callback) => {
  socket.on('dangerZoneUpdate', callback);
};

export const subscribeToDeletions = (callback) => {
  socket.on('dangerZoneRemoved', callback);
};

export const unsubscribeFromUpdates = () => {
  socket.off('dangerZoneUpdate');
};

export const unsubscribeFromDeletions = () => {
  socket.off('dangerZoneRemoved');
};

export default socket;
