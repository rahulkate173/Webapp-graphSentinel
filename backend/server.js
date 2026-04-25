import http from "http";
import app from "./src/app.js";
import ConnectToDB from "./src/config/database.js";
import { initSocket } from "./src/config/socket.js";

ConnectToDB();

const PORT = process.env.PORT || 3000;

// Wrap Express in a native HTTP server so Socket.IO shares the same port
const httpServer = http.createServer(app);

// Attach Socket.IO (registers join_bank + all connection handlers)
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
