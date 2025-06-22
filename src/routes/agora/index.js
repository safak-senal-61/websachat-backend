// src/routes/agora/index.js
// Bu dosya, sadece agora ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

const tokenRoutes = require('./token_routes.js');

// Rotaları birleştir
router.use('/', tokenRoutes);

module.exports = router;
