import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socket from '../socket.js';
import { upsertJob } from '../jobs.slice.js';

/**
 * Connects the Socket.IO client, joins the authenticated user's bank room,
 * and forwards every "job_update" event into the Redux jobs store.
 */
export function useJobSocket() {
  const dispatch = useDispatch();
  const user     = useSelector((state) => state.auth.user);

  useEffect(() => {
    // ── Diagnostic: always log what auth.user looks like ─────────────────────
    console.log('[Socket] useJobSocket effect ran. auth.user =', user);

    // Auth controller sends { id } not { _id } — accept both
    const userId = user?.id || user?._id;

    if (!userId) {
      console.warn('[Socket] No user id yet — socket will not connect until user is loaded.');
      return;
    }

    const bankId = String(userId);
    console.log(`[Socket] bankId resolved: ${bankId}`);

    // ── Helper to join bank room ──────────────────────────────────────────────
    const joinRoom = () => {
      console.log(`[Socket] ✅ Emitting join_bank for bankId: ${bankId} (socket.id: ${socket.id})`);
      socket.emit('join_bank', bankId);
    };

    // ── Connect ───────────────────────────────────────────────────────────────
    console.log(`[Socket] socket.connected = ${socket.connected}. Calling socket.connect()…`);
    socket.connect();

    // If socket is ALREADY connected (e.g. hot-reload / strict-mode double run),
    // the 'connect' event won't fire again — so join immediately.
    if (socket.connected) {
      console.log('[Socket] Already connected — joining room immediately.');
      joinRoom();
    }

    // ── Join bank room when connected (handles new connections + reconnects) ──
    socket.on('connect', () => {
      console.log(`[Socket] 🔌 Connection established. socket.id = ${socket.id}`);
      joinRoom();
    });

    // ── Listen for job status updates ─────────────────────────────────────────
    socket.on('job_update', (update) => {
      console.log('[Socket] 📦 job_update received:', update);
      dispatch(upsertJob(update));
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] ❌ Connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] 🔴 Disconnected — reason: ${reason}`);
    });

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      socket.off('connect');
      socket.off('job_update');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.disconnect();
      console.log('[Socket] 🧹 Cleaned up and disconnected.');
    };
  }, [user?.id, user?._id, dispatch]);
}

