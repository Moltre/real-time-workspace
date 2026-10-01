'use strict';

const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/users/:id
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, 200, 'User fetched', { user });
});

/**
 * PUT /api/users/profile  (protected – own profile only)
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  sendSuccess(res, 200, 'Profile updated', { user });
});

/**
 * DELETE /api/users/account  (protected – own account only)
 */
const deactivateAccount = asyncHandler(async (req, res) => {
  await userService.deactivateUser(req.user._id);
  sendSuccess(res, 200, 'Account deactivated');
});

module.exports = { getUser, updateProfile, deactivateAccount };
