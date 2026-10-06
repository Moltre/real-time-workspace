'use strict';

const express = require('express');
const router = express.Router();
const listController = require('../controllers/list.controller');
const { updateListValidation } = require('../validators/list.validator');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);

router.patch('/:listId', updateListValidation, validate, listController.updateList);
router.delete('/:listId', listController.deleteList);

module.exports = router;
