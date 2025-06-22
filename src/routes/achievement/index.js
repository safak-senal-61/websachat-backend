// src/routes/achievement/index.js
// Bu dosya, achievement ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

// Achievement alt rotalarını import et
const achievementRoutes = require('./achievement_routes.js');
const userAchievementRoutes = require('./user_achievement_routes.js');

// Rotaları birleştir
router.use(achievementRoutes);
router.use(userAchievementRoutes);

module.exports = router;