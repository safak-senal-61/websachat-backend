// src/controllers/gift/index.js

const giftManagementController = require('./gift_management_controller.js');
const giftSendingController = require('./gift_sending_controller.js');
const giftHistoryController = require('./gift_history_controller.js');

module.exports = {
  ...giftManagementController,
  ...giftSendingController,
  ...giftHistoryController,
};
