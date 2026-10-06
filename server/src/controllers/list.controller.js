'use strict';

const listService = require('../services/list.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/** POST /api/boards/:boardId/lists */
const createList = asyncHandler(async (req, res) => {
  const list = await listService.createList(req.params.boardId, req.user._id, req.body);
  sendSuccess(res, 201, 'List created successfully', { list });
});

/** GET /api/boards/:boardId/lists */
const getListsByBoard = asyncHandler(async (req, res) => {
  const lists = await listService.getListsByBoard(req.params.boardId, req.user._id);
  sendSuccess(res, 200, 'Lists fetched successfully', { lists });
});

/** PATCH /api/lists/:listId */
const updateList = asyncHandler(async (req, res) => {
  const list = await listService.updateList(req.params.listId, req.user._id, req.body);
  sendSuccess(res, 200, 'List updated successfully', { list });
});

/** DELETE /api/lists/:listId */
const deleteList = asyncHandler(async (req, res) => {
  const result = await listService.deleteList(req.params.listId, req.user._id);
  sendSuccess(res, 200, result.message);
});

module.exports = { createList, getListsByBoard, updateList, deleteList };
