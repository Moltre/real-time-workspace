'use strict';

const Workspace = require('../models/workspace.model');
const { createError } = require('../utils/apiError');

/**
 * Get all workspaces the user owns or is a member of.
 */
const getWorkspaces = async (userId) => {
  return Workspace.find({
    $or: [{ owner: userId }, { 'members.user': userId }],
    isArchived: false,
  })
    .populate('owner', 'name email avatar')
    .sort({ updatedAt: -1 });
};

/**
 * Get a single workspace by ID (access check included).
 */
const getWorkspaceById = async (workspaceId, userId) => {
  const ws = await Workspace.findById(workspaceId).populate('owner', 'name email avatar');
  if (!ws) throw createError(404, 'Workspace not found');

  const isMember =
    ws.owner._id.toString() === userId.toString() ||
    ws.members.some((m) => m.user.toString() === userId.toString());

  if (!isMember) throw createError(403, 'Access denied');
  return ws;
};

/**
 * Create a new workspace.
 */
const createWorkspace = async (userId, data) => {
  const ws = await Workspace.create({
    ...data,
    owner: userId,
    members: [{ user: userId, role: 'admin' }],
  });
  return ws;
};

/**
 * Update a workspace (owner only).
 */
const updateWorkspace = async (workspaceId, userId, updates) => {
  const ws = await Workspace.findById(workspaceId);
  if (!ws) throw createError(404, 'Workspace not found');
  if (ws.owner.toString() !== userId.toString()) throw createError(403, 'Only the owner can update this workspace');

  const allowed = ['name', 'description', 'settings'];
  allowed.forEach((key) => {
    if (updates[key] !== undefined) ws[key] = updates[key];
  });

  await ws.save();
  return ws;
};

/**
 * Archive (soft-delete) a workspace.
 */
const deleteWorkspace = async (workspaceId, userId) => {
  const ws = await Workspace.findById(workspaceId);
  if (!ws) throw createError(404, 'Workspace not found');
  if (ws.owner.toString() !== userId.toString()) throw createError(403, 'Only the owner can delete this workspace');

  ws.isArchived = true;
  await ws.save();
  return ws;
};

module.exports = { getWorkspaces, getWorkspaceById, createWorkspace, updateWorkspace, deleteWorkspace };
