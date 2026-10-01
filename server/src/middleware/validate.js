'use strict';

const { validationResult } = require('express-validator');
const { createError } = require('../utils/apiError');

/**
 * Middleware to collect express-validator results and return 422 on failure.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(createError(422, messages.join(', ')));
  }
  next();
};

module.exports = validate;
