// src/controllers/message/index.js
// Bu dosya, 'message' ile ilgili tüm controller modüllerini tek bir nesnede birleştirir.

const messageActionsController = require('./message_actions_controller.js');
const messageStateController = require('./message_state_controller.js');
const roomFeaturesController = require('./room_features_controller.js');
const userInfoController = require('./user_info_controller.js'); // Eksik olan fonksiyonu içeren dosya

// Tüm bu modüllerin export ettiği fonksiyonları tek bir nesnede birleştirip dışa aktar
module.exports = {
  ...messageActionsController,
  ...messageStateController,
  ...roomFeaturesController,
  ...userInfoController, // Yeni fonksiyonları da bu pakete dahil et
};
