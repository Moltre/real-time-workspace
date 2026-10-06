'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const cookieParser = require('cookie-parser');

const corsOptions = require('./config/cors');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const workspaceRoutes = require('./routes/workspace.routes');
const boardRoutes = require('./routes/board.routes');
const listRoutes = require('./routes/list.routes');
const cardRoutes = require('./routes/card.routes');
const healthRoutes = require('./routes/health.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Security & logging ────────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan('dev'));

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));

// ── Body & Cookie parsers ─────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspaceRoutes);

// Board routes – /api/workspaces/:workspaceId/boards (create/list)
// and /api/boards/:boardId (get/update/delete + nested lists)
app.use('/api/workspaces', boardRoutes);   // handles /:workspaceId/boards
app.use('/api/boards', boardRoutes);       // handles /:boardId + /:boardId/lists
app.use('/api/lists', listRoutes);         // handles /:listId
app.use('/api/cards', cardRoutes);         // handles /:cardId + lists/:listId/cards + /:cardId/move

// ── 404 + Global error handler ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
