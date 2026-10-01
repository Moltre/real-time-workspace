'use strict';

/**
 * Factory for operational API errors.
 * Operational errors are expected (wrong password, not found, etc.)
 * and are formatted nicely for the client.
 */
const createError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.isOperational = true;
  return err;
};

module.exports = { createError };
