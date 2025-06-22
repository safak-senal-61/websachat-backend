// src/routes/matchmaking/skill_routes.js
const express = require('express');
const router = express.Router();
const matchmakingController = require('../../controllers/matchmaking');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /players/{userId}/games/{gameId}/skill:
 *   get:
 *     summary: "Belirli bir oyuncunun belirli bir oyundaki beceri seviyesini getirir"
 *     tags: [Matchmaking Skills]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Beceri seviyesi başarıyla getirildi"
 *       '404':
 *         description: "Oyuncu veya oyun bulunamadı"
 */
router.get('/players/:userId/games/:gameId/skill', matchmakingController.getPlayerSkill);

/**
 * @swagger
 * /players/{userId}/skills:
 *   get:
 *     summary: "Belirli bir oyuncunun tüm oyunlardaki beceri seviyelerini getirir"
 *     tags: [Matchmaking Skills]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Beceri seviyeleri başarıyla getirildi"
 *       '404':
 *         description: "Oyuncu bulunamadı"
 */
router.get('/players/:userId/skills', matchmakingController.getPlayerAllSkills);

/**
 * @swagger
 * /player/skills:
 *   get:
 *     summary: "Giriş yapmış kullanıcının tüm oyunlardaki beceri seviyelerini getirir"
 *     tags: [Matchmaking Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Beceri seviyeleri başarıyla getirildi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 */
router.get('/player/skills', authenticateToken, matchmakingController.getMySkills);

/**
 * @swagger
 * /games/{gameId}/leaderboard:
 *   get:
 *     summary: "Belirli bir oyunun skor tablosunu getirir"
 *     tags: [Matchmaking Skills]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "Getirilecek maksimum oyuncu sayısı"
 *     responses:
 *       '200':
 *         description: "Skor tablosu başarıyla getirildi"
 *       '404':
 *         description: "Oyun bulunamadı"
 */
router.get('/games/:gameId/leaderboard', matchmakingController.getGameLeaderboard);

module.exports = router;