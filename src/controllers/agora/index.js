// src/controllers/agora/index.js
// Bu dosya, sadece agora ile ilgili tüm alt controller dosyalarını birleştirir.

const tokenController = require('./token_controller.js');

module.exports = {
  ...tokenController,
};
