// src/routes/tournament/index.js
// Bu dosya, tournament ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

// Tournament alt rotalarını import et
const tournamentRoutes = require('./tournament_routes.js');
const participantRoutes = require('./participant_routes.js');
const matchRoutes = require('./match_routes.js');

// Rotaları birleştir
router.use(tournamentRoutes);
router.use(participantRoutes);
router.use(matchRoutes);

module.exports = router;