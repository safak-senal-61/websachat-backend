// src/routes/userPreferences/index.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');

const privacyRoutes = require('./privacy_routes.js');
const interactionRoutes = require('./interaction_routes.js');
const notificationRoutes = require('./notification_routes.js');
const localizationRoutes = require('./localization_routes.js');

// Bu modüldeki tüm rotalar için kimlik doğrulaması uygula
router.use(authenticateToken);

// Alt rotaları birleştir
router.use(privacyRoutes);
router.use(interactionRoutes);
router.use(notificationRoutes);
router.use(localizationRoutes);

module.exports = router;
