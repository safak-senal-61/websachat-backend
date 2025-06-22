// src/routes/matchmaking/session_routes.js
const express = require('express');
const router = express.Router();
const matchmakingController = require('../../controllers/matchmaking');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /games/sessions/custom:
 *   post:
 *     summary: "Özel bir oyun oturumu oluşturur"
 *     tags: [Matchmaking Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameId
 *             properties:
 *               gameId:
 *                 type: string
 *               name:
 *                 type: string
 *               maxPlayers:
 *                 type: integer
 *               isPrivate:
 *                 type: boolean
 *               password:
 *                 type: string
 *               settings:
 *                 type: object
 *     responses:
 *       '201':
 *         description: "Özel oyun oturumu başarıyla oluşturuldu"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Oyun bulunamadı"
 */
router.post('/games/sessions/custom', authenticateToken, matchmakingController.createCustomGameSession);

module.exports = router;