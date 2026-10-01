'use strict';

const User = require('./user.model');
const Workspace = require('./workspace.model');
const WorkspaceMember = require('./workspaceMember.model');
const Invitation = require('./invitation.model');
const Board = require('./board.model');
const List = require('./list.model');
const Card = require('./card.model');

module.exports = {
  User,
  Workspace,
  WorkspaceMember,
  Invitation,
  Board,
  List,
  Card,
};
