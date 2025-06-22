// src/controllers/game/index.js

// Bu dosya, 'game' ile ilgili tüm controller modüllerini tek bir nesnede birleştirir.
// Hata alıyorsanız, lütfen buradaki require yollarının ('./dosya_adi.js')
// src/controllers/game/ klasörünüzdeki gerçek dosya adlarıyla tam olarak eşleştiğinden emin olun.

// 1. Oyunların temel yönetim fonksiyonları (create, list, update, delete)
const gameManagementController = require('./game_management_controller.js');

// 2. Oyun kategorileri ile ilgili fonksiyonlar
const categoryController = require('./category_controller.js');

// 3. Kullanıcıların oyunlarla etkileşimi (like, rate)
const interactionController = require('./interaction_controller.js');

// 4. Oyuna ait oturumları (session) listeleyen fonksiyonlar
const sessionController = require('./session_controller.js');

// Tüm bu modüllerin export ettiği fonksiyonları tek bir nesnede birleştirip dışa aktar
module.exports = {
  ...gameManagementController,
  ...categoryController,
  ...interactionController,
  ...sessionController,
};
