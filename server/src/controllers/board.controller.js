'use strict';

const boardService = require('../services/board.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/** POST /api/workspaces/:workspaceId/boards */
const createBoard = asyncHandler(async (req, res) => {
  const board = await boardService.createBoard(req.params.workspaceId, req.user._id, req.body);
  sendSuccess(res, 201, 'Board created successfully', { board });
});

/** GET /api/workspaces/:workspaceId/boards */
const getBoardsByWorkspace = asyncHandler(async (req, res) => {
  const boards = await boardService.getBoardsByWorkspace(req.params.workspaceId, req.user._id);
  sendSuccess(res, 200, 'Boards fetched successfully', { boards });
});

/** GET /api/boards/:boardId */
const getBoard = asyncHandler(async (req, res) => {
  const board = await boardService.getBoardById(req.params.boardId, req.user._id);
  sendSuccess(res, 200, 'Board fetched successfully', { board });
});

/** PATCH /api/boards/:boardId */
const updateBoard = asyncHandler(async (req, res) => {
  const board = await boardService.updateBoard(req.params.boardId, req.user._id, req.body);
  sendSuccess(res, 200, 'Board updated successfully', { board });
});

/** DELETE /api/boards/:boardId */
const deleteBoard = asyncHandler(async (req, res) => {
  const result = await boardService.deleteBoard(req.params.boardId, req.user._id);
  sendSuccess(res, 200, result.message);
});

module.exports = { createBoard, getBoardsByWorkspace, getBoard, updateBoard, deleteBoard };
