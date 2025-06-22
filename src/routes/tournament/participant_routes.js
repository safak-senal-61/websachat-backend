// src/routes/tournament/participant_routes.js
const express = require('express');
const router = express.Router();
const tournamentController = require('../../controllers/tournament');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /tournaments/{tournamentId}/register:
 *   post:
 *     summary: "Bir turnuvaya kayıt olur"
 *     tags: [Tournament Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Turnuvaya başarıyla kayıt olundu"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Turnuva bulunamadı"
 */
router.post('/tournaments/:tournamentId/register', authenticateToken, tournamentController.registerForTournament);

/**
 * @swagger
 * /tournaments/{tournamentId}/participants:
 *   get:
 *     summary: "Bir turnuvanın katılımcılarını listeler"
 *     tags: [Tournament Participants]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Katılımcılar başarıyla listelendi"
 *       '404':
 *         description: "Turnuva bulunamadı"
 */
router.get('/tournaments/:tournamentId/participants', tournamentController.listTournamentParticipants);

/**
 * @swagger
 * /tournaments/{tournamentId}/withdraw:
 *   post:
 *     summary: "Bir turnuvadan çekilir"
 *     tags: [Tournament Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Turnuvadan başarıyla çekildi"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Turnuva bulunamadı"
 */
router.post('/tournaments/:tournamentId/withdraw', authenticateToken, tournamentController.withdrawFromTournament);

/**
 * @swagger
 * /user/tournaments:
 *   get:
 *     summary: "Kullanıcının katıldığı turnuvaları listeler"
 *     tags: [Tournament Participants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Kullanıcının turnuvaları başarıyla listelendi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 */
router.get('/user/tournaments', authenticateToken, tournamentController.getUserTournaments);

/**
 * @swagger
 * /tournaments/{tournamentId}/leaderboard:
 *   get:
 *     summary: "Bir turnuvanın skor tablosunu getirir"
 *     tags: [Tournament Participants]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Skor tablosu başarıyla getirildi"
 *       '404':
 *         description: "Turnuva bulunamadı"
 */
router.get('/tournaments/:tournamentId/leaderboard', tournamentController.getTournamentLeaderboard);

module.exports = router;