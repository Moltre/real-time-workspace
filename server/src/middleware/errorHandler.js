'use strict';

const logger = require('../utils/logger');

/**
 * 404 handler – catches requests that didn't match any route.
 */
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

/**
 * Global error handler.
 * Must have 4 parameters for Express to recognise it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isOperational = err.isOperational ?? false;

  // Log unexpected (programmer) errors
  if (!isOperational) {
    logger.error('Unexpected error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
