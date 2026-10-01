'use strict';

const mongoose = require('mongoose');

const workspaceMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      default: 'member',
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Ensure a user is only added once per workspace
workspaceMemberSchema.index({ workspace: 1, user: 1 }, { unique: true });
// Fast lookup of workspaces for a given user
workspaceMemberSchema.index({ user: 1 });
// Fast lookup of members for a given workspace
workspaceMemberSchema.index({ workspace: 1 });

module.exports = mongoose.model('WorkspaceMember', workspaceMemberSchema);
