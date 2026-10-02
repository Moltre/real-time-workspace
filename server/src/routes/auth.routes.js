'use strict';

const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { registerValidation, loginValidation } = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

// ── Authentication Endpoints ──────────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidation, validate, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token / set cookie
 * @access  Public
 */
router.post('/login', loginValidation, validate, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Log out user & clear HTTP-only cookie
 * @access  Public / Protected
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged-in user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;
