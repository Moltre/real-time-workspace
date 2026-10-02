'use strict';

const User = require('../models/user.model');
const { createError } = require('../utils/apiError');
const { generateToken } = require('../utils/jwt');

/**
 * Register a new user.
 * @param {object} userData
 * @returns {Promise<{user: object, token: string}>}
 */
const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError(409, 'Email already in use');
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return { user, token };
};

/**
 * Authenticate an existing user.
 * @param {object} credentials
 * @returns {Promise<{user: object, token: string}>}
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw createError(401, 'Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw createError(401, 'Invalid credentials');
  }

  if (!user.isActive) {
    throw createError(403, 'Account has been deactivated');
  }

  const token = generateToken(user._id);
  return { user, token };
};

/**
 * Fetch profile data for the current authenticated user.
 * @param {string|ObjectId} userId
 * @returns {Promise<object>}
 */
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw createError(404, 'User not found');
  }
  return user;
};

module.exports = {
  register,
  login,
  getMe,
};
