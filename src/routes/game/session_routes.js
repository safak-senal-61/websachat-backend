// src/routes/game/session_routes.js
const express = require('express');
const router = express.Router();
const gameController = require('../../controllers/game');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /games/{gameModelId}/sessions:
 *   get:
 *     summary: Belirli bir oyuna ait oyun oturumlarını listeler
 *     tags: [Games, GameSessions]
 *     parameters:
 *       - $ref: '#/components/parameters/GameModelIdPathParam'
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [WAITING, IN_PROGRESS, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Oyun oturumları başarıyla listelendi.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedGameSessionsResponse'
 */
router.get('/:gameModelId/sessions', gameController.getGameSessionsForGame);

module.exports = router;