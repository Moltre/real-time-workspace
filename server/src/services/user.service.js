'use strict';

const User = require('../models/user.model');
const { createError } = require('../utils/apiError');

/**
 * Get a user by ID.
 */
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw createError(404, 'User not found');
  return user;
};

/**
 * Update user profile (name, avatar).
 */
const updateProfile = async (id, updates) => {
  const allowed = ['name', 'avatar'];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  );

  const user = await User.findByIdAndUpdate(id, filtered, {
    new: true,
    runValidators: true,
  });
  if (!user) throw createError(404, 'User not found');
  return user;
};

/**
 * Deactivate (soft-delete) a user account.
 */
const deactivateUser = async (id) => {
  const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!user) throw createError(404, 'User not found');
  return user;
};

module.exports = { getUserById, updateProfile, deactivateUser };
