'use strict';

const { validationResult } = require('express-validator');
const { createError } = require('../utils/apiError');

/**
 * Middleware to collect express-validator results and return 422 on failure.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    const message = errorList.map((e) => e.message).join(', ');
    const err = createError(422, message);
    err.errors = errorList;
    return next(err);
  }
  next();
};

module.exports = validate;
