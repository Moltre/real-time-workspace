'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * GET /api/health
 * Returns overall service health (uptime, DB state, memory).
 */
router.get('/', (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbState[mongoose.connection.readyState] || 'unknown',
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
  });
});

module.exports = router;
