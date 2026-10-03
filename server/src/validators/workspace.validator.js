'use strict';

const { body } = require('express-validator');

/**
 * Validation rules for workspace creation.
 */
const createWorkspaceValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Workspace name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Workspace name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

/**
 * Validation rules for workspace update.
 */
const updateWorkspaceValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Workspace name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

/**
 * Validation rules for adding workspace member.
 */
const addMemberValidation = [
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('userId')
    .optional()
    .trim()
    .isMongoId()
    .withMessage('Valid user ID required'),
  body()
    .custom((value, { req }) => {
      if (!req.body.email && !req.body.userId) {
        throw new Error('Either email or userId must be provided');
      }
      return true;
    }),
  body('role')
    .optional()
    .toUpperCase()
    .isIn(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'])
    .withMessage('Role must be one of: OWNER, ADMIN, MEMBER, VIEWER'),
];

module.exports = {
  createWorkspaceValidation,
  updateWorkspaceValidation,
  addMemberValidation,
};
