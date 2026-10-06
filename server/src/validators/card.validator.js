'use strict';

const { body } = require('express-validator');

const createCardValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Card title is required')
    .isLength({ min: 1, max: 255 }).withMessage('Card title cannot exceed 255 characters'),
  body('description').optional().trim(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priority must be low, medium, high, or urgent'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
  body('labels').optional().isArray().withMessage('Labels must be an array'),
  body('assignedTo').optional().isArray().withMessage('AssignedTo must be an array'),
];

const updateCardValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 }).withMessage('Card title cannot exceed 255 characters'),
  body('description').optional().trim(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priority must be low, medium, high, or urgent'),
  body('dueDate').optional({ nullable: true }),
  body('labels').optional().isArray(),
  body('assignedTo').optional().isArray(),
  body('position').optional().isInt({ min: 0 }),
];

const moveCardValidation = [
  body('sourceListId').notEmpty().withMessage('sourceListId is required').isMongoId(),
  body('destinationListId').notEmpty().withMessage('destinationListId is required').isMongoId(),
  body('position').isInt({ min: 0 }).withMessage('Position must be a non-negative integer'),
];

module.exports = { createCardValidation, updateCardValidation, moveCardValidation };
