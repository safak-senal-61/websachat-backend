// src/routes/gameSession/management_routes.js
const express = require('express');
const router = express.Router();
const gameSessionController = require('../../controllers/gameSession');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /game-sessions:
 *   post:
 *     summary: Yeni bir oyun oturumu oluşturur
 *     tags: [GameSessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GameSessionCreateRequest'
 *     responses:
 *       201:
 *         description: Oyun oturumu başarıyla oluşturuldu.
 */
router.post('/', authenticateToken, gameSessionController.createGameSession);

/**
 * @swagger
 * /game-sessions:
 *   get:
 *     summary: Oyun oturumlarını listeler (sayfalanmış, filtrelenebilir)
 *     tags: [GameSessions]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - name: gameId
 *         in: query
 *         schema:
 *           type: string
 *         description: "Oyun ID'sine göre filtrele"
 *       - name: hostId
 *         in: query
 *         schema:
 *           type: string
 *         description: "Host ID'sine göre filtrele"
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [WAITING, IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: "Duruma göre filtrele"
 *     responses:
 *       200:
 *         description: Oyun oturumları listelendi.
 */
router.get('/', gameSessionController.listGameSessions);

/**
 * @swagger
 * /game-sessions/{sessionId}:
 *   get:
 *     summary: Belirli bir oyun oturumunun detaylarını getirir
 *     tags: [GameSessions]
 *     parameters:
 *       - $ref: '#/components/parameters/SessionIdPathParam'
 *     responses:
 *       200:
 *         description: Oturum detayları getirildi.
 *       404:
 *         description: Oturum bulunamadı.
 */
router.get('/:sessionId', gameSessionController.getGameSessionById);

module.exports = router;