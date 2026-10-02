'use strict';

const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a given user ID.
 * @param {string|ObjectId} userId
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify and decode a JWT token.
 * @param {string} token
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Get cookie configuration options for HTTP-only JWT storage.
 * @returns {object} Cookie options
 */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  };
};

/**
 * Set HTTP-only auth token cookie on response.
 * @param {object} res Express response object
 * @param {string} token JWT token
 */
const setAuthCookie = (res, token) => {
  res.cookie('token', token, getCookieOptions());
};

/**
 * Clear HTTP-only auth token cookie on response.
 * @param {object} res Express response object
 */
const clearAuthCookie = (res) => {
  res.cookie('token', '', {
    ...getCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });
};

module.exports = {
  generateToken,
  verifyToken,
  getCookieOptions,
  setAuthCookie,
  clearAuthCookie,
};
