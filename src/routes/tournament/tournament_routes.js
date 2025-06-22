// src/routes/tournament/tournament_routes.js
const express = require('express');
const router = express.Router();
const tournamentController = require('../../controllers/tournament');
const { authenticateToken, authorizeRoles } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /tournaments:
 *   post:
 *     summary: "Yeni bir turnuva oluşturur"
 *     tags: [Tournaments]
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
 *               - name
 *               - format
 *               - startDate
 *               - registrationStart
 *               - registrationEnd
 *               - maxParticipants
 *             properties:
 *               gameId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               format:
 *                 type: string
 *                 enum: [SINGLE_ELIMINATION, DOUBLE_ELIMINATION, ROUND_ROBIN, SWISS]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               registrationStart:
 *                 type: string
 *                 format: date-time
 *               registrationEnd:
 *                 type: string
 *                 format: date-time
 *               maxParticipants:
 *                 type: integer
 *               entryFee:
 *                 type: number
 *               prizePool:
 *                 type: number
 *               rules:
 *                 type: string
 *               coverImageUrl:
 *                 type: string
 *     responses:
 *       '201':
 *         description: "Turnuva başarıyla oluşturuldu"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 */
router.post('/tournaments', authenticateToken, tournamentController.createTournament);

/**
 * @swagger
 * /tournaments:
 *   get:
 *     summary: "Tüm turnuvaları listeler"
 *     tags: [Tournaments]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [UPCOMING, ONGOING, COMPLETED, CANCELLED]
 *         description: "Turnuva durumuna göre filtreleme"
 *       - in: query
 *         name: gameId
 *         schema:
 *           type: string
 *         description: "Oyun ID'sine göre filtreleme"
 *     responses:
 *       '200':
 *         description: "Turnuvalar başarıyla listelendi"
 */
router.get('/tournaments', tournamentController.listTournaments);

/**
 * @swagger
 * /tournaments/{tournamentId}:
 *   get:
 *     summary: "Belirli bir turnuvanın detaylarını getirir"
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Turnuva detayları başarıyla getirildi"
 *       '404':
 *         description: "Turnuva bulunamadı"
 */
router.get('/tournaments/:tournamentId', tournamentController.getTournamentById);

/**
 * @swagger
 * /tournaments/{tournamentId}/generate-matches:
 *   post:
 *     summary: "Turnuva için maçları oluşturur"
 *     tags: [Tournaments]
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
 *         description: "Maçlar başarıyla oluşturuldu"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Turnuva bulunamadı"
 */
router.post('/tournaments/:tournamentId/generate-matches', authenticateToken, tournamentController.generateTournamentMatches);

module.exports = router;