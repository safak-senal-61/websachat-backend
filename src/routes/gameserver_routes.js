// src/routes/gameserver_routes.js
const express = require('express');
const router = express.Router();
const gameServerController = require('../controllers/gameserver');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Sunucu listeleme ve detay görüntüleme (herkese açık)
router.get('/', gameServerController.listGameServers);
router.get('/:serverId', gameServerController.getGameServerById);

// Sunucu yönetimi (sadece admin)
router.post('/', authenticateToken, authorizeRoles('ADMIN'), gameServerController.createGameServer);
router.put('/:serverId', authenticateToken, authorizeRoles('ADMIN'), gameServerController.updateGameServer);
router.delete('/:serverId', authenticateToken, authorizeRoles('ADMIN'), gameServerController.deleteGameServer);
router.put('/:serverId/status', authenticateToken, authorizeRoles('ADMIN', 'SYSTEM'), gameServerController.updateServerStatus);

// Oturum yönetimi
router.get('/:serverId/sessions', authenticateToken, gameServerController.listServerSessions);
router.post('/sessions/start', authenticateToken, gameServerController.startServerSession);
router.post('/sessions/:sessionId/end', authenticateToken, gameServerController.endServerSession);

// Oyuncu yönetimi
router.get('/sessions/:sessionId/players', authenticateToken, gameServerController.listSessionPlayers);
router.post('/sessions/:sessionId/players', authenticateToken, gameServerController.addPlayerToSession);
router.delete('/sessions/:sessionId/players/:playerId?', authenticateToken, gameServerController.removePlayerFromSession);

module.exports = router;