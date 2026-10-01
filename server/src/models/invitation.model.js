'use strict';

const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'InvitedBy user ID is required'],
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      default: 'member',
    },
    token: {
      type: String,
      required: [true, 'Invitation token is required'],
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'expired'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Fast token lookup for invitation validation
invitationSchema.index({ token: 1 }, { unique: true });
// Fast query for active invitations per workspace and email
invitationSchema.index({ workspace: 1, email: 1 });
// Query user invitations by email
invitationSchema.index({ email: 1 });
// Index for cleanup of expired tokens
invitationSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Invitation', invitationSchema);
