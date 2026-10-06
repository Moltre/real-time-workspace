'use strict';

const mongoose = require('mongoose');
const Card = require('../models/card.model');
const List = require('../models/list.model');
const Board = require('../models/board.model');
const WorkspaceMember = require('../models/workspaceMember.model');
const { createError } = require('../utils/apiError');

const requireWorkspaceMember = async (workspaceId, userId) => {
  const member = await WorkspaceMember.findOne({ workspace: workspaceId, user: userId });
  if (!member) throw createError(403, 'Access denied: You are not a member of this workspace');
  return member;
};

const populateCard = (query) =>
  query
    .populate('createdBy', 'name email avatar')
    .populate('assignedTo', 'name email avatar');

/**
 * POST /api/lists/:listId/cards
 * Create a new card inside a list.
 */
const createCard = async (listId, userId, { title, description, priority, dueDate, labels, assignedTo }) => {
  if (!mongoose.Types.ObjectId.isValid(listId)) throw createError(404, 'List not found');

  const list = await List.findById(listId);
  if (!list) throw createError(404, 'List not found');

  const board = await Board.findById(list.board);
  if (!board) throw createError(404, 'Board not found');

  await requireWorkspaceMember(board.workspace, userId);

  const count = await Card.countDocuments({ list: listId });

  const card = await Card.create({
    board: list.board,
    list: listId,
    title,
    description: description || '',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    labels: labels || [],
    assignedTo: assignedTo || [],
    position: count,
    createdBy: userId,
  });

  return populateCard(Card.findById(card._id));
};

/**
 * GET /api/lists/:listId/cards
 * Get all cards for a list (ordered by position).
 */
const getCardsByList = async (listId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(listId)) throw createError(404, 'List not found');

  const list = await List.findById(listId);
  if (!list) throw createError(404, 'List not found');

  const board = await Board.findById(list.board);
  if (!board) throw createError(404, 'Board not found');

  await requireWorkspaceMember(board.workspace, userId);

  return populateCard(Card.find({ list: listId }).sort({ position: 1, createdAt: 1 }));
};

/**
 * GET /api/cards/:cardId
 * Get a single card.
 */
const getCardById = async (cardId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(cardId)) throw createError(404, 'Card not found');

  const card = await populateCard(Card.findById(cardId));
  if (!card) throw createError(404, 'Card not found');

  const board = await Board.findById(card.board);
  if (!board) throw createError(404, 'Board not found');

  await requireWorkspaceMember(board.workspace, userId);
  return card;
};

/**
 * PATCH /api/cards/:cardId
 * Update card fields.
 */
const updateCard = async (cardId, userId, updates) => {
  if (!mongoose.Types.ObjectId.isValid(cardId)) throw createError(404, 'Card not found');

  const card = await Card.findById(cardId);
  if (!card) throw createError(404, 'Card not found');

  const board = await Board.findById(card.board);
  if (!board) throw createError(404, 'Board not found');

  await requireWorkspaceMember(board.workspace, userId);

  const allowed = ['title', 'description', 'priority', 'dueDate', 'labels', 'assignedTo', 'position'];
  allowed.forEach((key) => {
    if (updates[key] !== undefined) card[key] = updates[key];
  });

  await card.save();
  return populateCard(Card.findById(card._id));
};

/**
 * DELETE /api/cards/:cardId
 * Delete a card.
 */
const deleteCard = async (cardId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(cardId)) throw createError(404, 'Card not found');

  const card = await Card.findById(cardId);
  if (!card) throw createError(404, 'Card not found');

  const board = await Board.findById(card.board);
  if (!board) throw createError(404, 'Board not found');

  await requireWorkspaceMember(board.workspace, userId);
  await Card.deleteOne({ _id: cardId });
  return { message: 'Card deleted successfully' };
};

/**
 * PATCH /api/cards/:cardId/move
 * Move a card to a different list or reorder within the same list.
 * Body: { sourceListId, destinationListId, position }
 */
const moveCard = async (cardId, userId, { sourceListId, destinationListId, position }) => {
  if (!mongoose.Types.ObjectId.isValid(cardId)) throw createError(404, 'Card not found');

  const card = await Card.findById(cardId);
  if (!card) throw createError(404, 'Card not found');

  const board = await Board.findById(card.board);
  if (!board) throw createError(404, 'Board not found');

  await requireWorkspaceMember(board.workspace, userId);

  const destList = await List.findById(destinationListId);
  if (!destList) throw createError(404, 'Destination list not found');
  if (destList.board.toString() !== card.board.toString())
    throw createError(400, 'Destination list does not belong to the same board');

  const isSameList = sourceListId === destinationListId;

  if (!isSameList) {
    // Moving to different list: shift cards in destination down
    await Card.updateMany(
      { list: destinationListId, position: { $gte: position } },
      { $inc: { position: 1 } }
    );
    // Close gap in source list
    await Card.updateMany(
      { list: sourceListId, position: { $gt: card.position } },
      { $inc: { position: -1 } }
    );
    card.list = destinationListId;
  } else {
    // Reordering within same list
    const oldPosition = card.position;
    if (oldPosition < position) {
      await Card.updateMany(
        { list: sourceListId, position: { $gt: oldPosition, $lte: position } },
        { $inc: { position: -1 } }
      );
    } else if (oldPosition > position) {
      await Card.updateMany(
        { list: sourceListId, position: { $gte: position, $lt: oldPosition } },
        { $inc: { position: 1 } }
      );
    }
  }

  card.position = position;
  await card.save();
  return populateCard(Card.findById(card._id));
};

module.exports = {
  createCard,
  getCardsByList,
  getCardById,
  updateCard,
  deleteCard,
  moveCard,
};
