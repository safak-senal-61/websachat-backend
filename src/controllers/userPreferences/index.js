// src/controllers/userPreferences/index.js

const privacyController = require('./privacy_controller.js');
const interactionController = require('./interaction_controller.js');
const notificationController = require('./notification_controller.js');
const localizationController = require('./localization_controller.js');

module.exports = {
  ...privacyController,
  ...interactionController,
  ...notificationController,
  ...localizationController,
};
