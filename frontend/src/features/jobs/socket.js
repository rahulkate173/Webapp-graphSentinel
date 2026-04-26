import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Single shared socket instance for the entire app.
 * We disable autoConnect so the hook controls the lifecycle explicitly.
 */
const socket = io(BACKEND_URL, {
  autoConnect: false,
  withCredentials: true,
});

export default socket;
