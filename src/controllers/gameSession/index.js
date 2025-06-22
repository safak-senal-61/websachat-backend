// src/controllers/gameSession/index.js

const managementController = require('./management_controller.js');
const participantController = require('./participant_controller.js');
const stateController = require('./state_controller.js');

module.exports = {
  ...managementController,
  ...participantController,
  ...stateController,
};
