'use strict';

const workspaceService = require('../services/workspace.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/workspaces */
const getWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await workspaceService.getWorkspaces(req.user._id);
  sendSuccess(res, 200, 'Workspaces fetched', { workspaces });
});

/** GET /api/workspaces/:id */
const getWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.getWorkspaceById(req.params.id, req.user._id);
  sendSuccess(res, 200, 'Workspace fetched', { workspace });
});

/** POST /api/workspaces */
const createWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.createWorkspace(req.user._id, req.body);
  sendSuccess(res, 201, 'Workspace created', { workspace });
});

/** PUT /api/workspaces/:id */
const updateWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.updateWorkspace(req.params.id, req.user._id, req.body);
  sendSuccess(res, 200, 'Workspace updated', { workspace });
});

/** DELETE /api/workspaces/:id */
const deleteWorkspace = asyncHandler(async (req, res) => {
  await workspaceService.deleteWorkspace(req.params.id, req.user._id);
  sendSuccess(res, 200, 'Workspace archived');
});

module.exports = { getWorkspaces, getWorkspace, createWorkspace, updateWorkspace, deleteWorkspace };
