// src/routes/gift/index.js
// Bu dosya, sadece gift ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

const managementRoutes = require('./management_routes.js');
const sendingRoutes = require('./sending_routes.js');
const historyRoutes = require('./history_routes.js');

// Rotaları birleştir.
router.use('/', managementRoutes);
router.use('/', sendingRoutes);
router.use('/', historyRoutes);

module.exports = router;
