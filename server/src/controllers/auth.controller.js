'use strict';

const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const { user, token } = await authService.register({ name, email, password });
  sendSuccess(res, 201, 'Account created successfully', { user, token });
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });
  sendSuccess(res, 200, 'Login successful', { user, token });
});

/**
 * GET /api/auth/me  (protected)
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  sendSuccess(res, 200, 'User fetched', { user });
});

module.exports = { register, login, getMe };
