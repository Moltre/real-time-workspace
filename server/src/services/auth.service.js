'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { createError } = require('../utils/apiError');

/**
 * Register a new user.
 */
const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw createError(409, 'Email already in use');

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);

  return { user, token };
};

/**
 * Login an existing user.
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw createError(401, 'Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw createError(401, 'Invalid credentials');

  if (!user.isActive) throw createError(403, 'Account has been deactivated');

  const token = signToken(user._id);
  return { user, token };
};

/**
 * Return the user associated with a given JWT (used by /me endpoint).
 */
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw createError(404, 'User not found');
  return user;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

module.exports = { register, login, getMe };
