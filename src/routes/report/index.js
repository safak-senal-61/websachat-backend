// src/routes/report/index.js
// Bu dosya, sadece report ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

const userRoutes = require('./user_actions_routes.js');
const adminRoutes = require('./admin_actions_routes.js');

// Rotaları birleştir.
router.use('/', userRoutes);
router.use('/', adminRoutes);

module.exports = router;
