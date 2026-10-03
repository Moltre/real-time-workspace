'use strict';

const mongoose = require('mongoose');
const Workspace = require('../models/workspace.model');
const WorkspaceMember = require('../models/workspaceMember.model');
const User = require('../models/user.model');
const { createError } = require('../utils/apiError');

/**
 * Normalize role string to uppercase (OWNER, ADMIN, MEMBER, VIEWER).
 */
const normalizeRole = (role) => {
  if (!role) return 'MEMBER';
  const upper = role.toString().toUpperCase();
  const valid = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'];
  return valid.includes(upper) ? upper : 'MEMBER';
};

/**
 * Create a new workspace and assign creator as OWNER.
 */
const createWorkspace = async (userId, { name, description, settings }) => {
  const ws = await Workspace.create({
    name,
    description: description || '',
    settings: settings || {},
    owner: userId,
    members: [{ user: userId, role: 'OWNER' }],
  });

  await WorkspaceMember.create({
    workspace: ws._id,
    user: userId,
    role: 'OWNER',
  });

  return Workspace.findById(ws._id).populate('owner', 'name email avatar');
};

/**
 * Get all workspaces the user is a member of.
 */
const getWorkspaces = async (userId) => {
  // Find all member relationships for the user
  const memberEntries = await WorkspaceMember.find({ user: userId });
  const workspaceIds = memberEntries.map((m) => m.workspace);

  const workspaces = await Workspace.find({
    _id: { $in: workspaceIds },
    isArchived: false,
  })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ updatedAt: -1 });

  // Map entries to include current user's role
  const memberRoleMap = new Map(memberEntries.map((m) => [m.workspace.toString(), m.role]));

  return workspaces.map((ws) => {
    const obj = ws.toObject();
    obj.currentUserRole = normalizeRole(memberRoleMap.get(ws._id.toString()) || (ws.owner._id.toString() === userId.toString() ? 'OWNER' : 'MEMBER'));
    return obj;
  });
};

/**
 * Get a single workspace by ID with membership check.
 */
const getWorkspaceById = async (workspaceId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    throw createError(404, 'Workspace not found');
  }

  const memberEntry = await WorkspaceMember.findOne({ workspace: workspaceId, user: userId });
  if (!memberEntry) {
    throw createError(403, 'Access denied: You are not a member of this workspace');
  }

  const ws = await Workspace.findOne({ _id: workspaceId, isArchived: false })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  if (!ws) {
    throw createError(404, 'Workspace not found');
  }

  const obj = ws.toObject();
  obj.currentUserRole = normalizeRole(memberEntry.role);
  return obj;
};

/**
 * Update workspace details (OWNER or ADMIN only).
 */
const updateWorkspace = async (workspaceId, userId, updates) => {
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    throw createError(404, 'Workspace not found');
  }

  const memberEntry = await WorkspaceMember.findOne({ workspace: workspaceId, user: userId });
  if (!memberEntry) {
    throw createError(403, 'Access denied: You are not a member of this workspace');
  }

  const role = normalizeRole(memberEntry.role);
  if (role !== 'OWNER' && role !== 'ADMIN') {
    throw createError(403, 'Insufficient permissions to update workspace');
  }

  const ws = await Workspace.findOne({ _id: workspaceId, isArchived: false });
  if (!ws) {
    throw createError(404, 'Workspace not found');
  }

  const allowed = ['name', 'description', 'settings'];
  allowed.forEach((key) => {
    if (updates[key] !== undefined) ws[key] = updates[key];
  });

  await ws.save();
  return Workspace.findById(ws._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');
};

/**
 * Delete (archive) a workspace (OWNER only).
 */
const deleteWorkspace = async (workspaceId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    throw createError(404, 'Workspace not found');
  }

  const memberEntry = await WorkspaceMember.findOne({ workspace: workspaceId, user: userId });
  if (!memberEntry) {
    throw createError(403, 'Access denied: You are not a member of this workspace');
  }

  const role = normalizeRole(memberEntry.role);
  if (role !== 'OWNER') {
    throw createError(403, 'Only the workspace owner can delete this workspace');
  }

  const ws = await Workspace.findOne({ _id: workspaceId, isArchived: false });
  if (!ws) {
    throw createError(404, 'Workspace not found');
  }

  ws.isArchived = true;
  await ws.save();
  return { message: 'Workspace deleted successfully' };
};

/**
 * Add a new member to a workspace (OWNER or ADMIN only).
 */
const addMember = async (workspaceId, requesterUserId, { email, userId, role }) => {
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    throw createError(404, 'Workspace not found');
  }

  const requesterMember = await WorkspaceMember.findOne({ workspace: workspaceId, user: requesterUserId });
  if (!requesterMember) {
    throw createError(403, 'Access denied: You are not a member of this workspace');
  }

  const requesterRole = normalizeRole(requesterMember.role);
  if (requesterRole !== 'OWNER' && requesterRole !== 'ADMIN') {
    throw createError(403, 'Only workspace owners or admins can add members');
  }

  const targetRole = normalizeRole(role || 'MEMBER');

  // Prevent assigning OWNER role via addMember endpoint unless requester is OWNER
  if (targetRole === 'OWNER' && requesterRole !== 'OWNER') {
    throw createError(403, 'Only the workspace owner can assign the OWNER role');
  }

  let targetUser;
  if (email) {
    targetUser = await User.findOne({ email: email.toLowerCase() });
  } else if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw createError(404, 'User not found');
    }
    targetUser = await User.findById(userId);
  }

  if (!targetUser) {
    throw createError(404, 'User not found');
  }

  const existing = await WorkspaceMember.findOne({ workspace: workspaceId, user: targetUser._id });
  if (existing) {
    throw createError(409, 'User is already a member of this workspace');
  }

  const newMember = await WorkspaceMember.create({
    workspace: workspaceId,
    user: targetUser._id,
    role: targetRole,
  });

  // Sync with Workspace model members array
  await Workspace.findByIdAndUpdate(workspaceId, {
    $push: { members: { user: targetUser._id, role: targetRole } },
  });

  const populated = await WorkspaceMember.findById(newMember._id).populate('user', 'name email avatar');
  return populated;
};

/**
 * Get all members of a workspace (Any workspace member).
 */
const getMembers = async (workspaceId, requesterUserId) => {
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    throw createError(404, 'Workspace not found');
  }

  const requesterMember = await WorkspaceMember.findOne({ workspace: workspaceId, user: requesterUserId });
  if (!requesterMember) {
    throw createError(403, 'Access denied: You are not a member of this workspace');
  }

  const members = await WorkspaceMember.find({ workspace: workspaceId })
    .populate('user', 'name email avatar')
    .sort({ createdAt: 1 });

  return members.map((m) => {
    const obj = m.toObject();
    obj.role = normalizeRole(obj.role);
    return obj;
  });
};

/**
 * Remove a member from a workspace (or leave workspace).
 */
const removeMember = async (workspaceId, targetUserId, requesterUserId) => {
  if (!mongoose.Types.ObjectId.isValid(workspaceId) || !mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw createError(404, 'Workspace or member not found');
  }

  const requesterMember = await WorkspaceMember.findOne({ workspace: workspaceId, user: requesterUserId });
  if (!requesterMember) {
    throw createError(403, 'Access denied: You are not a member of this workspace');
  }

  const targetMember = await WorkspaceMember.findOne({ workspace: workspaceId, user: targetUserId });
  if (!targetMember) {
    throw createError(404, 'Member not found in workspace');
  }

  const targetRole = normalizeRole(targetMember.role);
  const requesterRole = normalizeRole(requesterMember.role);
  const isSelf = targetUserId.toString() === requesterUserId.toString();

  // Rule 1: Cannot remove workspace owner
  if (targetRole === 'OWNER') {
    throw createError(403, 'Cannot remove the workspace owner');
  }

  // Rule 2: If removing someone else, requester must be OWNER or ADMIN
  if (!isSelf) {
    if (requesterRole !== 'OWNER' && requesterRole !== 'ADMIN') {
      throw createError(403, 'Only workspace owners or admins can remove members');
    }
    // Rule 3: ADMIN cannot remove another ADMIN or OWNER
    if (requesterRole === 'ADMIN' && (targetRole === 'ADMIN' || targetRole === 'OWNER')) {
      throw createError(403, 'Admins cannot remove other admins or owners');
    }
  }

  await WorkspaceMember.deleteOne({ _id: targetMember._id });

  // Sync with Workspace model
  await Workspace.findByIdAndUpdate(workspaceId, {
    $pull: { members: { user: targetUserId } },
  });

  return { message: 'Member removed successfully' };
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  getMembers,
  removeMember,
};
