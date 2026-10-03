'use strict';

const express = require('express');
const router = express.Router();

const workspaceController = require('../controllers/workspace.controller');
const {
  createWorkspaceValidation,
  updateWorkspaceValidation,
  addMemberValidation,
} = require('../validators/workspace.validator');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All workspace routes require authentication
router.use(authenticate);

// ── Workspace CRUD Endpoints ──────────────────────────────────────────────────

/**
 * @route   POST /api/workspaces
 * @desc    Create a new workspace
 * @access  Private
 */
router.post('/', createWorkspaceValidation, validate, workspaceController.createWorkspace);

/**
 * @route   GET /api/workspaces
 * @desc    Get current user's workspaces
 * @access  Private
 */
router.get('/', workspaceController.getWorkspaces);

/**
 * @route   GET /api/workspaces/:workspaceId
 * @desc    Get workspace details by ID
 * @access  Private (Workspace Members)
 */
router.get('/:workspaceId', workspaceController.getWorkspace);
router.get('/id/:id', workspaceController.getWorkspace); // fallback alias

/**
 * @route   PATCH /api/workspaces/:workspaceId
 * @desc    Update workspace details
 * @access  Private (Workspace OWNER or ADMIN)
 */
router.patch('/:workspaceId', updateWorkspaceValidation, validate, workspaceController.updateWorkspace);
router.put('/:workspaceId', updateWorkspaceValidation, validate, workspaceController.updateWorkspace); // compatibility alias

/**
 * @route   DELETE /api/workspaces/:workspaceId
 * @desc    Delete (archive) workspace
 * @access  Private (Workspace OWNER)
 */
router.delete('/:workspaceId', workspaceController.deleteWorkspace);

// ── Workspace Member Endpoints ────────────────────────────────────────────────

/**
 * @route   POST /api/workspaces/:workspaceId/members
 * @desc    Add member to workspace
 * @access  Private (Workspace OWNER or ADMIN)
 */
router.post('/:workspaceId/members', addMemberValidation, validate, workspaceController.addMember);

/**
 * @route   GET /api/workspaces/:workspaceId/members
 * @desc    Get all workspace members
 * @access  Private (Workspace Members)
 */
router.get('/:workspaceId/members', workspaceController.getMembers);

/**
 * @route   DELETE /api/workspaces/:workspaceId/members/:userId
 * @desc    Remove member from workspace (or leave workspace)
 * @access  Private (Workspace OWNER, ADMIN, or Self)
 */
router.delete('/:workspaceId/members/:userId', workspaceController.removeMember);

module.exports = router;
