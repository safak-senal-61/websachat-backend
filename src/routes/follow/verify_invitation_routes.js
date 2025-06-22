// src/routes/follow/verify_invitation_routes.js
const express = require('express');
const router = express.Router();
const followController = require('../../controllers/follow');

/**
 * @swagger
 * /follows/invitation/verify/{token}:
 *   get:
 *     summary: "Arkadaş davet linkini doğrular"
 *     tags: [Invitation]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: "Davet token'ı"
 *     responses:
 *       200:
 *         description: "Davet başarıyla doğrulandı"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Davet başarıyla doğrulandı."
 *                 data:
 *                   type: object
 *                   properties:
 *                     inviterUsername:
 *                       type: string
 *                       example: "davet_eden_kullanici"
 *       400:
 *         description: "Geçersiz veya süresi dolmuş token"
 *       500:
 *         description: "Sunucu hatası"
 */
router.get('/invitation/verify/:token', followController.verifyInvitationToken);

module.exports = router;