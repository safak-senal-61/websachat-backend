// src/controllers/userSettings/index.js

const profileController = require('./profile_controller.js');
const securityController = require('./security_controller.js');
const accountController = require('./account_controller.js');

module.exports = {
  ...profileController,
  ...securityController,
  ...accountController,
};
