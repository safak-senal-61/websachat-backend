// src/routes/game/interaction_routes.js
const express = require('express');
const router = express.Router();
const gameController = require('../../controllers/game');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /games/{gameModelId}/like:
 *   post:
 *     summary: Bir oyunu beğenir veya beğeniyi geri alır (toggle)
 *     tags: [Games, UserActions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GameModelIdPathParam'
 *     responses:
 *       200:
 *         description: Beğeni durumu başarıyla güncellendi.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameLikeResponse'
 */
router.post('/:gameModelId/like', authenticateToken, gameController.likeGame);

/**
 * @swagger
 * /games/{gameModelId}/rate:
 *   post:
 *     summary: Bir oyuna puan verir veya mevcut puanı günceller
 *     tags: [Games, UserActions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GameModelIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GameRatingRequest'
 *     responses:
 *       200:
 *         description: Puan başarıyla kaydedildi veya güncellendi.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameRatingResponse'
 */
router.post('/:gameModelId/rate', authenticateToken, gameController.rateGame);

/**
 * @swagger
 * /games/{gameModelId}/ratings:
 *   get:
 *     summary: Bir oyun için verilen tüm puanları ve yorumları listeler
 *     tags: [Games]
 *     parameters:
 *       - $ref: '#/components/parameters/GameModelIdPathParam'
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *     responses:
 *       200:
 *         description: Oyun puanları başarıyla listelendi.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedGameRatingsResponse'
 */
router.get('/:gameModelId/ratings', gameController.getGameRatings);

module.exports = router;