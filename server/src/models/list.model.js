'use strict';

const mongoose = require('mongoose');

const listSchema = new mongoose.Schema(
  {
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'Board ID is required'],
    },
    name: {
      type: String,
      required: [true, 'List name is required'],
      trim: true,
      maxlength: [100, 'List name cannot exceed 100 characters'],
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Efficient sorting and retrieving of lists inside a board
listSchema.index({ board: 1, position: 1 });

module.exports = mongoose.model('List', listSchema);
