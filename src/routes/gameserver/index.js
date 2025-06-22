// src/routes/gameserver/index.js
// Bu dosya, gameserver ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

// Gameserver alt rotalarını import et
const serverRoutes = require('./server_routes.js');
const sessionRoutes = require('./session_routes.js');
const playerRoutes = require('./player_routes.js');

// Rotaları birleştir
router.use(serverRoutes);
router.use(sessionRoutes);
router.use(playerRoutes);

module.exports = router;