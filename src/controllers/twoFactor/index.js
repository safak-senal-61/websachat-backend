// src/controllers/twoFactor/index.js

const setupController = require('./setup_controller.js');
const verificationController = require('./verification_controller.js');
const backupCodesController = require('./backup_codes_controller.js');

module.exports = {
  ...setupController,
  ...verificationController,
  ...backupCodesController,
};
