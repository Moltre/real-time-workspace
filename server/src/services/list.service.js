'use strict';

const mongoose = require('mongoose');
const List = require('../models/list.model');
const Board = require('../models/board.model');
const Card = require('../models/card.model');
const WorkspaceMember = require('../models/workspaceMember.model');
const { createError } = require('../utils/apiError');

const requireWorkspaceMember = async (workspaceId, userId) => {
  const member = await WorkspaceMember.findOne({ workspace: workspaceId, user: userId });
  if (!member) throw createError(403, 'Access denied: You are not a member of this workspace');
  return member;
};

/**
 * POST /api/boards/:boardId/lists
 * Create a new list inside a board.
 */
const createList = async (boardId, userId, { name }) => {
  if (!mongoose.Types.ObjectId.isValid(boardId)) throw createError(404, 'Board not found');

  const board = await Board.findById(boardId);
  if (!board) throw createError(404, 'Board not found');

  await requireWorkspaceMember(board.workspace, userId);

  // Assign next position within the board
  const count = await List.countDocuments({ board: boardId });

  const list = await List.create({ board: boardId, name, position: count });
  return list;
};

/**
 * GET /api/boards/:boardId/lists
 * Get all lists for a board (ordered by position).
 */
const getListsByBoard = async (boardId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(boardId)) throw createError(404, 'Board not found');

  const board = await Board.findById(boardId);
  if (!board) throw createError(404, 'Board not found');

  await requireWorkspaceMember(board.workspace, userId);

  return List.find({ board: boardId }).sort({ position: 1, createdAt: 1 });
};

/**
 * PATCH /api/lists/:listId
 * Update list name or position.
 */
const updateList = async (listId, userId, updates) => {
  if (!mongoose.Types.ObjectId.isValid(listId)) throw createError(404, 'List not found');

  const list = await List.findById(listId);
  if (!list) throw createError(404, 'List not found');

  const board = await Board.findById(list.board);
  if (!board) throw createError(404, 'Board not found');

  await requireWorkspaceMember(board.workspace, userId);

  if (updates.name !== undefined) list.name = updates.name;
  if (updates.position !== undefined) list.position = updates.position;
  await list.save();
  return list;
};

/**
 * DELETE /api/lists/:listId
 * Delete a list and all its cards.
 */
const deleteList = async (listId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(listId)) throw createError(404, 'List not found');

  const list = await List.findById(listId);
  if (!list) throw createError(404, 'List not found');

  const board = await Board.findById(list.board);
  if (!board) throw createError(404, 'Board not found');

  await requireWorkspaceMember(board.workspace, userId);

  // Remove all cards in this list
  await Card.deleteMany({ list: listId });
  await List.deleteOne({ _id: listId });
  return { message: 'List deleted successfully' };
};

module.exports = {
  createList,
  getListsByBoard,
  updateList,
  deleteList,
};
