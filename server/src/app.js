'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const corsOptions = require('./config/cors');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const workspaceRoutes = require('./routes/workspace.routes');
const healthRoutes = require('./routes/health.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Security & logging ────────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan('dev'));

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspaceRoutes);

// ── 404 + Global error handler ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
