// src/routes/matchmaking_routes.js
const express = require('express');
const router = express.Router();
const matchmakingController = require('../controllers/matchmaking');
const { authenticateToken } = require('../middleware/authMiddleware');

// Beceri seviyesi rotaları
router.get('/players/:userId/games/:gameId/skill', matchmakingController.getPlayerSkill);
router.get('/players/:userId/skills', matchmakingController.getPlayerAllSkills);
router.get('/player/skills', authenticateToken, matchmakingController.getMySkills);
router.get('/games/:gameId/leaderboard', matchmakingController.getGameLeaderboard);

// Eşleştirme kuyruğu rotaları
router.post('/games/:gameId/matchmaking/join', authenticateToken, matchmakingController.joinMatchmakingQueue);
router.post('/games/:gameId/matchmaking/leave', authenticateToken, matchmakingController.leaveMatchmakingQueue);
router.get('/matchmaking/queue/:queueId', authenticateToken, matchmakingController.checkQueueStatus);

// Özel oyun oturumları rotaları
router.post('/games/sessions/custom', authenticateToken, matchmakingController.createCustomGameSession);

module.exports = router;