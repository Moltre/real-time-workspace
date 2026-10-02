'use strict';

const User = require('../models/user.model');
const { createError } = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/jwt');

/**
 * Protect routes – verify JWT (from cookie or Bearer header) and attach req.user.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fall back to Authorization header (Bearer token)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw createError(401, 'Authentication token missing');
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw createError(401, 'Invalid or expired token');
  }

  const user = await User.findById(decoded.sub);
  if (!user) {
    throw createError(401, 'User no longer exists');
  }

  if (!user.isActive) {
    throw createError(403, 'Account has been deactivated');
  }

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
