// src/routes/gameSession/index.js
// Bu dosya, sadece gameSession ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

const managementRoutes = require('./management_routes.js');
const participantRoutes = require('./participant_routes.js');
const stateRoutes = require('./state_routes.js');

// Rotaları birleştir.
router.use('/', managementRoutes);
router.use('/', participantRoutes);
router.use('/', stateRoutes);

module.exports = router;