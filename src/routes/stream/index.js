// src/routes/stream/index.js
// Bu dosya, sadece stream ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

const managementRoutes = require('./management_routes.js');
const listingRoutes = require('./listing_routes.js');
const interactionRoutes = require('./interaction_routes.js');

// Rotaları birleştir.
router.use('/', managementRoutes);
router.use('/', listingRoutes);
router.use('/', interactionRoutes);

module.exports = router;
