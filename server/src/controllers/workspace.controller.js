'use strict';

const workspaceService = require('../services/workspace.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/workspaces
 * Create a new workspace.
 */
const createWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.createWorkspace(req.user._id, req.body);
  sendSuccess(res, 201, 'Workspace created successfully', { workspace });
});

/**
 * GET /api/workspaces
 * Get all workspaces for current authenticated user.
 */
const getWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await workspaceService.getWorkspaces(req.user._id);
  sendSuccess(res, 200, 'Workspaces fetched successfully', { workspaces });
});

/**
 * GET /api/workspaces/:workspaceId
 * Get workspace details by ID.
 */
const getWorkspace = asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId || req.params.id;
  const workspace = await workspaceService.getWorkspaceById(workspaceId, req.user._id);
  sendSuccess(res, 200, 'Workspace fetched successfully', { workspace });
});

/**
 * PATCH /api/workspaces/:workspaceId
 * Update workspace details.
 */
const updateWorkspace = asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId || req.params.id;
  const workspace = await workspaceService.updateWorkspace(workspaceId, req.user._id, req.body);
  sendSuccess(res, 200, 'Workspace updated successfully', { workspace });
});

/**
 * DELETE /api/workspaces/:workspaceId
 * Delete (archive) workspace.
 */
const deleteWorkspace = asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId || req.params.id;
  const result = await workspaceService.deleteWorkspace(workspaceId, req.user._id);
  sendSuccess(res, 200, result.message);
});

/**
 * POST /api/workspaces/:workspaceId/members
 * Add a member to a workspace.
 */
const addMember = asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId || req.params.id;
  const member = await workspaceService.addMember(workspaceId, req.user._id, req.body);
  sendSuccess(res, 201, 'Workspace member added successfully', { member });
});

/**
 * GET /api/workspaces/:workspaceId/members
 * Get all members of a workspace.
 */
const getMembers = asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId || req.params.id;
  const members = await workspaceService.getMembers(workspaceId, req.user._id);
  sendSuccess(res, 200, 'Workspace members fetched successfully', { members });
});

/**
 * DELETE /api/workspaces/:workspaceId/members/:userId
 * Remove a member from a workspace.
 */
const removeMember = asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId || req.params.id;
  const result = await workspaceService.removeMember(workspaceId, req.params.userId, req.user._id);
  sendSuccess(res, 200, result.message);
});

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  getMembers,
  removeMember,
};
