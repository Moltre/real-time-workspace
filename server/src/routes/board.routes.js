'use strict';

const express = require('express');
const router = express.Router();
const boardController = require('../controllers/board.controller');
const listController = require('../controllers/list.controller');
const { updateBoardValidation } = require('../validators/board.validator');
const { createListValidation, updateListValidation } = require('../validators/list.validator');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);

// ── Single board endpoints ────────────────────────────────────────────────────
router.get('/:boardId', boardController.getBoard);
router.patch('/:boardId', updateBoardValidation, validate, boardController.updateBoard);
router.delete('/:boardId', boardController.deleteBoard);

// ── Lists nested under board ──────────────────────────────────────────────────
router.post('/:boardId/lists', createListValidation, validate, listController.createList);
router.get('/:boardId/lists', listController.getListsByBoard);

module.exports = router;
