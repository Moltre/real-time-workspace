'use strict';

const { Server } = require('socket.io');
const logger = require('../utils/logger');

/**
 * Initialise Socket.io and attach event handlers.
 * @param {import('http').Server} httpServer
 */
const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`⚡  Socket connected: ${socket.id}`);

    // ── Workspace room join / leave ──────────────────────────────────────────
    socket.on('workspace:join', (workspaceId) => {
      socket.join(`workspace:${workspaceId}`);
      logger.debug(`Socket ${socket.id} joined workspace:${workspaceId}`);
    });

    socket.on('workspace:leave', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
    });

    // ── Real-time cursor / presence (placeholder) ────────────────────────────
    socket.on('cursor:update', ({ workspaceId, position }) => {
      socket.to(`workspace:${workspaceId}`).emit('cursor:update', {
        socketId: socket.id,
        position,
      });
    });

    socket.on('disconnect', (reason) => {
      logger.info(`💤  Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

module.exports = initSocket;
