// src/routes/gameserver/player_routes.js
const express = require('express');
const router = express.Router();
const gameServerController = require('../../controllers/gameserver');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /sessions/{sessionId}/players:
 *   get:
 *     summary: "Bir oturumdaki oyuncuları listeler"
 *     tags: [Game Server Players]
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
 *         description: "Oturum oyuncuları başarıyla listelendi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Oturum bulunamadı"
 */
router.get('/sessions/:sessionId/players', authenticateToken, gameServerController.listSessionPlayers);

/**
 * @swagger
 * /sessions/{sessionId}/players:
 *   post:
 *     summary: "Bir oturuma oyuncu ekler"
 *     tags: [Game Server Players]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playerId:
 *                 type: string
 *               team:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       '200':
 *         description: "Oyuncu oturuma başarıyla eklendi"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Oturum bulunamadı"
 */
router.post('/sessions/:sessionId/players', authenticateToken, gameServerController.addPlayerToSession);

/**
 * @swagger
 * /sessions/{sessionId}/players/{playerId}:
 *   delete:
 *     summary: "Bir oturumdan oyuncu çıkarır"
 *     tags: [Game Server Players]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: playerId
 *         required: false
 *         schema:
 *           type: string
 *         description: "Belirtilmezse, istek sahibi oyuncu çıkarılır"
 *     responses:
 *       '200':
 *         description: "Oyuncu oturumdan başarıyla çıkarıldı"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Oturum veya oyuncu bulunamadı"
 */
router.delete('/sessions/:sessionId/players/:playerId?', authenticateToken, gameServerController.removePlayerFromSession);

module.exports = router;