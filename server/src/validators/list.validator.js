'use strict';

const { body } = require('express-validator');

const createListValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('List name is required')
    .isLength({ min: 1, max: 100 }).withMessage('List name must be between 1 and 100 characters'),
];

const updateListValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('List name must be between 1 and 100 characters'),
  body('position')
    .optional()
    .isInt({ min: 0 }).withMessage('Position must be a non-negative integer'),
];

module.exports = { createListValidation, updateListValidation };
