// src/routes/matchmaking/index.js
// Bu dosya, matchmaking ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

// Matchmaking alt rotalarını import et
const skillRoutes = require('./skill_routes.js');
const queueRoutes = require('./queue_routes.js');
const sessionRoutes = require('./session_routes.js');

// Rotaları birleştir
router.use(skillRoutes);
router.use(queueRoutes);
router.use(sessionRoutes);

module.exports = router;