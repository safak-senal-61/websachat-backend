// src/routes/matchmaking/queue_routes.js
const express = require('express');
const router = express.Router();
const matchmakingController = require('../../controllers/matchmaking');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /games/{gameId}/matchmaking/join:
 *   post:
 *     summary: "Eşleştirme kuyruğuna katılır"
 *     tags: [Matchmaking Queue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferences:
 *                 type: object
 *                 description: "Eşleştirme tercihleri"
 *     responses:
 *       '200':
 *         description: "Kuyruğa başarıyla katılındı"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Oyun bulunamadı"
 */
router.post('/games/:gameId/matchmaking/join', authenticateToken, matchmakingController.joinMatchmakingQueue);

/**
 * @swagger
 * /games/{gameId}/matchmaking/leave:
 *   post:
 *     summary: "Eşleştirme kuyruğundan ayrılır"
 *     tags: [Matchmaking Queue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Kuyruktan başarıyla ayrılındı"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Oyun veya kuyruk bulunamadı"
 */
router.post('/games/:gameId/matchmaking/leave', authenticateToken, matchmakingController.leaveMatchmakingQueue);

/**
 * @swagger
 * /matchmaking/queue/{queueId}:
 *   get:
 *     summary: "Kuyruk durumunu kontrol eder"
 *     tags: [Matchmaking Queue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: queueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Kuyruk durumu başarıyla getirildi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Kuyruk bulunamadı"
 */
router.get('/matchmaking/queue/:queueId', authenticateToken, matchmakingController.checkQueueStatus);

module.exports = router;