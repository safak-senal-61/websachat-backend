// src/routes/message/index.js
// Bu dosya, sadece message ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

const actionsRoutes = require('./actions_routes.js');
const stateRoutes = require('./state_routes.js');
const roomFeaturesRoutes = require('./room_features_routes.js');
const userInfoRoutes = require('./user_info_routes.js');

// Rotaları birleştir.
router.use('/', actionsRoutes);
router.use('/', stateRoutes);
router.use('/', roomFeaturesRoutes);
router.use('/', userInfoRoutes);

module.exports = router;
