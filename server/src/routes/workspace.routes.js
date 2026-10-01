'use strict';

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const workspaceController = require('../controllers/workspace.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const createRules = [
  body('name').trim().notEmpty().withMessage('Workspace name is required').isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 }),
];

const updateRules = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().isLength({ max: 500 }),
];

router.use(authenticate); // All workspace routes require auth

router.get('/', workspaceController.getWorkspaces);
router.get('/:id', workspaceController.getWorkspace);
router.post('/', createRules, validate, workspaceController.createWorkspace);
router.put('/:id', updateRules, validate, workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

module.exports = router;
