// src/controllers/notification/index.js

const notificationManagementController = require('./notification_management_controller.js');
const notificationSendingController = require('./notification_sending_controller.js');

module.exports = {
  ...notificationManagementController,
  ...notificationSendingController,
};
