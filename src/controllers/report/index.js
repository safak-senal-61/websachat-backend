// src/controllers/report/index.js

const userActionsController = require('./user_actions_controller.js');
const adminActionsController = require('./admin_actions_controller.js');

module.exports = {
  ...userActionsController,
  ...adminActionsController,
};
