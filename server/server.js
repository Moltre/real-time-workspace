'use strict';

require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const initSocket = require('./src/sockets');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

(async () => {
  // Connect to MongoDB
  await connectDB();

  // Create HTTP server
  const server = http.createServer(app);

  // Attach Socket.io
  initSocket(server);

  server.listen(PORT, () => {
    logger.info(`🚀  Server running on http://localhost:${PORT}  [${process.env.NODE_ENV}]`);
  });

  // ── Graceful shutdown ────────────────────────────────────────────────────────
  const shutdown = (signal) => {
    logger.info(`${signal} received – shutting down gracefully`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
})();
