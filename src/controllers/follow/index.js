// src/controllers/follow/index.js

const actionsController = require('./actions_controller.js');
const requestsController = require('./requests_controller.js');
const listingController = require('./listing_controller.js');
const blockingController = require('./blocking_controller.js');
const discoveryController = require('./discovery_controller.js');

module.exports = {
  ...actionsController,
  ...requestsController,
  ...listingController,
  ...blockingController,
  ...discoveryController,
};
