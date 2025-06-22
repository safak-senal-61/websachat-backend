// src/routes/gameSession/state_routes.js
const express = require('express');
const router = express.Router();
const gameSessionController = require('../../controllers/gameSession');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /game-sessions/{sessionId}/status:
 *   put:
 *     summary: Oyun oturumunun durumunu günceller (Sadece Host veya Admin)
 *     tags: [GameSessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SessionIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GameSessionStatusUpdateRequest'
 *     responses:
 *       200:
 *         description: Oturum durumu güncellendi.
 *       403:
 *         description: Yetkiniz yok.
 */
router.put('/:sessionId/status', authenticateToken, gameSessionController.updateGameSessionStatus);

module.exports = router;