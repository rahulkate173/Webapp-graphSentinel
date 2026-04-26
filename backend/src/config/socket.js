import { Server } from "socket.io";

let io;

/**
 * Attaches Socket.IO to the existing HTTP server and registers room handlers.
 * Call once from server.js, then import `getIO()` anywhere you need to emit.
 *
 * @param {import("http").Server} httpServer
 * @returns {import("socket.io").Server}
 */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:4173",
        "https://graph-sentinal.vercel.app",
        "https://webapp-graph-sentinel.vercel.app"
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000, // Helps with Render connection drops
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] 🔌 Client connected: ${socket.id}`);

    // Let a client join its own bank room so it only receives its own updates
    socket.on("join_bank", (bankId) => {
      if (!bankId) return;
      socket.join(bankId);
      // Log all rooms this socket is now in
      console.log(`[Socket.IO] ✅ Socket ${socket.id} joined room "${bankId}". Rooms: ${[...socket.rooms].join(", ")}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] 🔴 Client disconnected: ${socket.id}`);
    });
  });

  // Helper used by controllers to log room size before emitting
  io.logRoomSize = async (bankId) => {
    const sockets = await io.in(bankId).fetchSockets();
    console.log(`[Socket.IO] Room "${bankId}" has ${sockets.length} subscriber(s).`);
  };

  return io;

}

/**
 * Returns the active Socket.IO server instance.
 * Throws if initSocket() has not been called yet.
 */
export function getIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialised. Call initSocket(httpServer) first.");
  }
  return io;
}
