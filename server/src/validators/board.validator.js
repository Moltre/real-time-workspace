'use strict';

const { body } = require('express-validator');

const createBoardValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Board name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Board name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

const updateBoardValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Board name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

module.exports = { createBoardValidation, updateBoardValidation };
