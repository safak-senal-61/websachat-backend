// src/routes/gameserver/session_routes.js
const express = require('express');
const router = express.Router();
const gameServerController = require('../../controllers/gameserver');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /{serverId}/sessions:
 *   get:
 *     summary: "Bir sunucunun oturumlarını listeler"
 *     tags: [Game Server Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Sunucu oturumları başarıyla listelendi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Sunucu bulunamadı"
 */
router.get('/:serverId/sessions', authenticateToken, gameServerController.listServerSessions);

/**
 * @swagger
 * /sessions/start:
 *   post:
 *     summary: "Yeni bir sunucu oturumu başlatır"
 *     tags: [Game Server Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serverId
 *               - gameId
 *             properties:
 *               serverId:
 *                 type: string
 *               gameId:
 *                 type: string
 *               name:
 *                 type: string
 *               maxPlayers:
 *                 type: integer
 *               settings:
 *                 type: object
 *     responses:
 *       '201':
 *         description: "Sunucu oturumu başarıyla başlatıldı"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Sunucu veya oyun bulunamadı"
 */
router.post('/sessions/start', authenticateToken, gameServerController.startServerSession);

/**
 * @swagger
 * /sessions/{sessionId}/end:
 *   post:
 *     summary: "Bir sunucu oturumunu sonlandırır"
 *     tags: [Game Server Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Sunucu oturumu başarıyla sonlandırıldı"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Oturum bulunamadı"
 */
router.post('/sessions/:sessionId/end', authenticateToken, gameServerController.endServerSession);

module.exports = router;