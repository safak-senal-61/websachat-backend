// src/routes/tournament_routes.js
const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournament');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Turnuva yönetimi rotaları
router.post('/tournaments', authenticateToken, tournamentController.createTournament);
router.get('/tournaments', tournamentController.listTournaments);
router.get('/tournaments/:tournamentId', tournamentController.getTournamentById);
router.post('/tournaments/:tournamentId/register', authenticateToken, tournamentController.registerForTournament);
router.post('/tournaments/:tournamentId/generate-matches', authenticateToken, tournamentController.generateTournamentMatches);
router.put('/tournaments/matches/:matchId/result', authenticateToken, authorizeRoles('ADMIN', 'MODERATOR'), tournamentController.updateMatchResult);

// Katılımcı yönetimi rotaları
router.get('/tournaments/:tournamentId/participants', tournamentController.listTournamentParticipants);
router.post('/tournaments/:tournamentId/withdraw', authenticateToken, tournamentController.withdrawFromTournament);
router.get('/user/tournaments', authenticateToken, tournamentController.getUserTournaments);
router.get('/tournaments/:tournamentId/leaderboard', tournamentController.getTournamentLeaderboard);

// Maç yönetimi rotaları
router.get('/tournaments/:tournamentId/matches', tournamentController.listTournamentMatches);
router.get('/tournaments/matches/:matchId', tournamentController.getMatchById);
router.get('/user/matches', authenticateToken, tournamentController.getUserMatches);
router.post('/tournaments/matches/:matchId/report', authenticateToken, tournamentController.reportMatchResult);
router.post('/tournaments/matches/:matchId/resolve', authenticateToken, authorizeRoles('ADMIN', 'MODERATOR'), tournamentController.resolveMatchDispute);

module.exports = router;