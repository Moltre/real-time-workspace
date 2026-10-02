'use strict';

const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const { setAuthCookie, clearAuthCookie } = require('../utils/jwt');

/**
 * POST /api/auth/register
 * Register a new user account.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const { user, token } = await authService.register({ name, email, password });

  setAuthCookie(res, token);
  sendSuccess(res, 201, 'Account created successfully', { user, token });
});

/**
 * POST /api/auth/login
 * Log in an existing user.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });

  setAuthCookie(res, token);
  sendSuccess(res, 200, 'Login successful', { user, token });
});

/**
 * POST /api/auth/logout
 * Log out current user and clear HTTP-only auth cookie.
 */
const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  sendSuccess(res, 200, 'Logged out successfully');
});

/**
 * GET /api/auth/me
 * Fetch authenticated user profile.
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  sendSuccess(res, 200, 'User profile fetched successfully', { user });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
};
