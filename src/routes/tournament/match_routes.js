// src/routes/tournament/match_routes.js
const express = require('express');
const router = express.Router();
const tournamentController = require('../../controllers/tournament');
const { authenticateToken, authorizeRoles } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /tournaments/{tournamentId}/matches:
 *   get:
 *     summary: "Bir turnuvanın maçlarını listeler"
 *     tags: [Tournament Matches]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Maçlar başarıyla listelendi"
 *       '404':
 *         description: "Turnuva bulunamadı"
 */
router.get('/tournaments/:tournamentId/matches', tournamentController.listTournamentMatches);

/**
 * @swagger
 * /tournaments/matches/{matchId}:
 *   get:
 *     summary: "Belirli bir maçın detaylarını getirir"
 *     tags: [Tournament Matches]
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Maç detayları başarıyla getirildi"
 *       '404':
 *         description: "Maç bulunamadı"
 */
router.get('/tournaments/matches/:matchId', tournamentController.getMatchById);

/**
 * @swagger
 * /user/matches:
 *   get:
 *     summary: "Kullanıcının maçlarını listeler"
 *     tags: [Tournament Matches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Kullanıcının maçları başarıyla listelendi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 */
router.get('/user/matches', authenticateToken, tournamentController.getUserMatches);

/**
 * @swagger
 * /tournaments/matches/{matchId}/report:
 *   post:
 *     summary: "Bir maç sonucunu bildirir"
 *     tags: [Tournament Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: object
 *               evidence:
 *                 type: string
 *     responses:
 *       '200':
 *         description: "Maç sonucu başarıyla bildirildi"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Maç bulunamadı"
 */
router.post('/tournaments/matches/:matchId/report', authenticateToken, tournamentController.reportMatchResult);

/**
 * @swagger
 * /tournaments/matches/{matchId}/result:
 *   put:
 *     summary: "Bir maç sonucunu günceller (Admin/Moderatör)"
 *     tags: [Tournament Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - winnerId
 *               - score
 *             properties:
 *               winnerId:
 *                 type: string
 *               score:
 *                 type: object
 *               notes:
 *                 type: string
 *     responses:
 *       '200':
 *         description: "Maç sonucu başarıyla güncellendi"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Maç bulunamadı"
 */
router.put('/tournaments/matches/:matchId/result', authenticateToken, authorizeRoles('ADMIN', 'MODERATOR'), tournamentController.updateMatchResult);

/**
 * @swagger
 * /tournaments/matches/{matchId}/resolve:
 *   post:
 *     summary: "Bir maç anlaşmazlığını çözer (Admin/Moderatör)"
 *     tags: [Tournament Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - winnerId
 *               - resolution
 *             properties:
 *               winnerId:
 *                 type: string
 *               score:
 *                 type: object
 *               resolution:
 *                 type: string
 *     responses:
 *       '200':
 *         description: "Anlaşmazlık başarıyla çözüldü"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Maç bulunamadı"
 */
router.post('/tournaments/matches/:matchId/resolve', authenticateToken, authorizeRoles('ADMIN', 'MODERATOR'), tournamentController.resolveMatchDispute);

module.exports = router;