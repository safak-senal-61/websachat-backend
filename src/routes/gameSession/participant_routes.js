// src/routes/gameSession/participant_routes.js
const express = require('express');
const router = express.Router();
const gameSessionController = require('../../controllers/gameSession');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /game-sessions/{sessionId}/join:
 *   post:
 *     summary: Bir oyun oturumuna katılır
 *     tags: [GameSessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SessionIdPathParam'
 *     responses:
 *       200:
 *         description: Oturuma başarıyla katıldınız.
 *       403:
 *         description: Oturum dolu veya katılım koşulları sağlanmıyor.
 *       404:
 *         description: Oturum bulunamadı.
 */
router.post('/:sessionId/join', authenticateToken, gameSessionController.joinGameSession);

/**
 * @swagger
 * /game-sessions/{sessionId}/leave:
 *   post:
 *     summary: Bir oyun oturumundan ayrılır
 *     tags: [GameSessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SessionIdPathParam'
 *     responses:
 *       200:
 *         description: Oturumdan başarıyla ayrıldınız.
 */
router.post('/:sessionId/leave', authenticateToken, gameSessionController.leaveGameSession);

/**
 * @swagger
 * /game-sessions/{sessionId}/kick/{targetUserId}:
 *   post:
 *     summary: Bir katılımcıyı oyun oturumundan atar (Sadece Host veya Admin)
 *     tags: [GameSessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SessionIdPathParam'
 *       - name: targetUserId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Atılacak kullanıcının ID'si.
 *     responses:
 *       200:
 *         description: Katılımcı başarıyla atıldı.
 *       403:
 *         description: Yetkiniz yok.
 *       404:
 *         description: Oturum veya kullanıcı bulunamadı.
 */
router.post('/:sessionId/kick/:targetUserId', authenticateToken, gameSessionController.kickParticipantFromSession);

module.exports = router;