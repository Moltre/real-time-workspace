'use strict';

const mongoose = require('mongoose');
const Board = require('../models/board.model');
const WorkspaceMember = require('../models/workspaceMember.model');
const { createError } = require('../utils/apiError');

/** Verify user is a member of the workspace. Returns the member entry. */
const requireWorkspaceMember = async (workspaceId, userId) => {
  const member = await WorkspaceMember.findOne({ workspace: workspaceId, user: userId });
  if (!member) throw createError(403, 'Access denied: You are not a member of this workspace');
  return member;
};

/** Verify user is OWNER or ADMIN of the workspace. */
const requireWorkspaceAdmin = async (workspaceId, userId) => {
  const member = await requireWorkspaceMember(workspaceId, userId);
  const role = member.role.toUpperCase();
  if (role !== 'OWNER' && role !== 'ADMIN')
    throw createError(403, 'Only workspace owners or admins can perform this action');
  return member;
};

/**
 * POST /api/workspaces/:workspaceId/boards
 * Create a new board inside a workspace.
 */
const createBoard = async (workspaceId, userId, { name, description }) => {
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) throw createError(404, 'Workspace not found');
  await requireWorkspaceMember(workspaceId, userId);

  // Assign next position
  const count = await Board.countDocuments({ workspace: workspaceId });

  const board = await Board.create({
    workspace: workspaceId,
    name,
    description: description || '',
    createdBy: userId,
    position: count,
  });

  return Board.findById(board._id)
    .populate('createdBy', 'name email avatar')
    .populate('workspace', 'name');
};

/**
 * GET /api/workspaces/:workspaceId/boards
 * List all boards for a workspace.
 */
const getBoardsByWorkspace = async (workspaceId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) throw createError(404, 'Workspace not found');
  await requireWorkspaceMember(workspaceId, userId);

  return Board.find({ workspace: workspaceId })
    .populate('createdBy', 'name email avatar')
    .sort({ position: 1, createdAt: 1 });
};

/**
 * GET /api/boards/:boardId
 * Get a single board (with workspace membership check).
 */
const getBoardById = async (boardId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(boardId)) throw createError(404, 'Board not found');

  const board = await Board.findById(boardId)
    .populate('createdBy', 'name email avatar')
    .populate('workspace', 'name settings');

  if (!board) throw createError(404, 'Board not found');

  await requireWorkspaceMember(board.workspace._id, userId);
  return board;
};

/**
 * PATCH /api/boards/:boardId
 * Update board name / description. Workspace ADMIN+ required.
 */
const updateBoard = async (boardId, userId, updates) => {
  if (!mongoose.Types.ObjectId.isValid(boardId)) throw createError(404, 'Board not found');

  const board = await Board.findById(boardId);
  if (!board) throw createError(404, 'Board not found');

  await requireWorkspaceMember(board.workspace, userId);

  if (updates.name !== undefined) board.name = updates.name;
  if (updates.description !== undefined) board.description = updates.description;
  await board.save();

  return Board.findById(board._id)
    .populate('createdBy', 'name email avatar')
    .populate('workspace', 'name settings');
};

/**
 * DELETE /api/boards/:boardId
 * Delete a board. Workspace ADMIN+ required.
 */
const deleteBoard = async (boardId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(boardId)) throw createError(404, 'Board not found');

  const board = await Board.findById(boardId);
  if (!board) throw createError(404, 'Board not found');

  await requireWorkspaceAdmin(board.workspace, userId);
  await Board.deleteOne({ _id: boardId });
  return { message: 'Board deleted successfully' };
};

module.exports = {
  createBoard,
  getBoardsByWorkspace,
  getBoardById,
  updateBoard,
  deleteBoard,
};
