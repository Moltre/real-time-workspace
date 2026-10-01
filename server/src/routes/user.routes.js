'use strict';

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const updateRules = [
  body('name').optional().trim().isLength({ min: 1, max: 80 }),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
];

router.get('/:id', authenticate, userController.getUser);
router.put('/profile', authenticate, updateRules, validate, userController.updateProfile);
router.delete('/account', authenticate, userController.deactivateAccount);

module.exports = router;
