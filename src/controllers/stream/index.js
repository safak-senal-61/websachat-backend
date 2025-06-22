// src/controllers/stream/index.js

const managementController = require('./management_controller.js');
const listingController = require('./listing_controller.js');
const webrtcController = require('./webrtc_controller.js');

module.exports = {
  ...managementController,
  ...listingController,
  ...webrtcController,
};
