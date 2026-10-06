'use strict';

const cardService = require('../services/card.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/** POST /api/lists/:listId/cards */
const createCard = asyncHandler(async (req, res) => {
  const card = await cardService.createCard(req.params.listId, req.user._id, req.body);
  sendSuccess(res, 201, 'Card created successfully', { card });
});

/** GET /api/lists/:listId/cards */
const getCardsByList = asyncHandler(async (req, res) => {
  const cards = await cardService.getCardsByList(req.params.listId, req.user._id);
  sendSuccess(res, 200, 'Cards fetched successfully', { cards });
});

/** GET /api/cards/:cardId */
const getCard = asyncHandler(async (req, res) => {
  const card = await cardService.getCardById(req.params.cardId, req.user._id);
  sendSuccess(res, 200, 'Card fetched successfully', { card });
});

/** PATCH /api/cards/:cardId */
const updateCard = asyncHandler(async (req, res) => {
  const card = await cardService.updateCard(req.params.cardId, req.user._id, req.body);
  sendSuccess(res, 200, 'Card updated successfully', { card });
});

/** DELETE /api/cards/:cardId */
const deleteCard = asyncHandler(async (req, res) => {
  const result = await cardService.deleteCard(req.params.cardId, req.user._id);
  sendSuccess(res, 200, result.message);
});

/** PATCH /api/cards/:cardId/move */
const moveCard = asyncHandler(async (req, res) => {
  const card = await cardService.moveCard(req.params.cardId, req.user._id, req.body);
  sendSuccess(res, 200, 'Card moved successfully', { card });
});

module.exports = { createCard, getCardsByList, getCard, updateCard, deleteCard, moveCard };
