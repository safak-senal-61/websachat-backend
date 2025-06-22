// src/controllers/chatRoom/index.js

// Dosya adlarıyla eşleşmesi için require yollarındaki '.' (nokta) '_' (alt çizgi) ile değiştirildi.
const roomController = require('./room_controller.js');
const participantController = require('./participant_controller.js');
const moderationController = require('./moderation_controller.js');
const messageController = require('./message_controller.js');
const searchController = require('./search_controller.js');

module.exports = {
  ...roomController,
  ...participantController,
  ...moderationController,
  ...messageController,
  ...searchController,
};
