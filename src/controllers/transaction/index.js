// src/controllers/transaction/index.js

const userActionsController = require('./user_actions_controller.js');
const paymentGatewayController = require('./payment_gateway_controller.js');
const adminActionsController = require('./admin_actions_controller.js');

module.exports = {
  ...userActionsController,
  ...paymentGatewayController,
  ...adminActionsController,
};
