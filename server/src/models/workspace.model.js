'use strict';

const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [100, 'Workspace name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['viewer', 'editor', 'admin'], default: 'editor' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
    settings: {
      isPublic: { type: Boolean, default: false },
      color: { type: String, default: '#6366f1' },
      icon: { type: String, default: '📁' },
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Workspace', workspaceSchema);
