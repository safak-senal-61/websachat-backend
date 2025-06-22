// src/routes/notification/index.js
// Bu dosya, sadece notification ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

const userRoutes = require('./user_routes.js');
const adminRoutes = require('./admin_routes.js');

// Rotaları birleştir.
router.use('/', userRoutes);
router.use('/', adminRoutes);

module.exports = router;
