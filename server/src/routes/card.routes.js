'use strict';

const express = require('express');
const router = express.Router();
const cardController = require('../controllers/card.controller');
const listController = require('../controllers/list.controller');
const {
  createCardValidation,
  updateCardValidation,
  moveCardValidation,
} = require('../validators/card.validator');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);

// ── Cards nested under list ───────────────────────────────────────────────────
router.post('/lists/:listId/cards', createCardValidation, validate, cardController.createCard);
router.get('/lists/:listId/cards', cardController.getCardsByList);

// ── Standalone card endpoints ─────────────────────────────────────────────────
router.get('/:cardId', cardController.getCard);
router.patch('/:cardId', updateCardValidation, validate, cardController.updateCard);
router.delete('/:cardId', cardController.deleteCard);
router.patch('/:cardId/move', moveCardValidation, validate, cardController.moveCard);

module.exports = router;
