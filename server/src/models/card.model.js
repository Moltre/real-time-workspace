'use strict';

const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'Board ID is required'],
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: [true, 'List ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Card title is required'],
      trim: true,
      maxlength: [255, 'Card title cannot exceed 255 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    labels: [
      {
        type: String,
        trim: true,
      },
    ],
    position: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user ID is required'],
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Efficient ordered query for cards in a list
cardSchema.index({ list: 1, position: 1 });
// Query cards per board
cardSchema.index({ board: 1 });
// Query cards assigned to a specific user
cardSchema.index({ assignedTo: 1 });
// Query cards by due date (for upcoming/overdue tasks)
cardSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Card', cardSchema);
