// src/routes/transaction/index.js
// Bu dosya, sadece transaction ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

const userRoutes = require('./user_actions_routes.js');
const paymentRoutes = require('./payment_gateway_routes.js');
const adminRoutes = require('./admin_actions_routes.js');

// Rotaları birleştir.
router.use('/', userRoutes);
router.use('/', paymentRoutes);
router.use('/', adminRoutes);

module.exports = router;
