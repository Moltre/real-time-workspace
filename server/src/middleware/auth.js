'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { createError } = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Protect routes – verify Bearer JWT and attach req.user.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) throw createError(401, 'Authentication token missing');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createError(401, 'Invalid or expired token');
  }

  const user = await User.findById(decoded.sub);
  if (!user) throw createError(401, 'User no longer exists');
  if (!user.isActive) throw createError(403, 'Account has been deactivated');

  req.user = user;
  next();
});

/**
 * Restrict access to specific roles.
 * Usage: authorize('admin') or authorize('admin', 'user')
 */
const authorize = (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(createError(403, 'Insufficient permissions'));
    }
    next();
  };

module.exports = { authenticate, authorize };
