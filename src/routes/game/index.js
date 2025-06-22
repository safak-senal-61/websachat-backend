// src/routes/game/index.js
// Bu dosya, sadece game ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

const gameManagementRoutes = require('./game_management_routes.js');
const categoryRoutes = require('./category_routes.js');
const interactionRoutes = require('./interaction_routes.js');
const sessionRoutes = require('./session_routes.js');

// Rotaları birleştir. Express, '/categories' veya '/:gameModelId/like' gibi
// farklı başlangıçlara sahip yolları doğru şekilde yönetecek ve birleştirecektir.
router.use(gameManagementRoutes);
router.use(categoryRoutes);
router.use(interactionRoutes);
router.use(sessionRoutes);

module.exports = router;
