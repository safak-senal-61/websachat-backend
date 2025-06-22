// src/routes/follow/invitation_routes.js
const express = require('express');
const router = express.Router();
const followController = require('../../controllers/follow');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /follows/invitation/create-link:
 *   post:
 *     summary: "Arkadaş davet linki oluşturur."
 *     tags: [Invitation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Davet linki başarıyla oluşturuldu."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     invitationLink:
 *                       type: string
 *                     expiresIn:
 *                       type: string
 */
router.post('/invitation/create-link', authenticateToken, followController.createInvitationLink);

/**
 * @swagger
 * /follows/invitation/send-email:
 *   post:
 *     summary: "Arkadaş davet linkini e-posta ile gönderir."
 *     tags: [Invitation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: "Davet e-postası başarıyla gönderildi."
 */
router.post('/invitation/send-email', authenticateToken, followController.sendInvitationEmail);

/**
 * @swagger
 * /follows/invitation/history:
 *   get:
 *     summary: "Kullanıcının davet geçmişini listeler."
 *     tags: [Invitation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Davet geçmişi başarıyla getirildi."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     invitations:
 *                       type: array
 *                       items:
 *                         type: object
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalInvitations:
 *                           type: integer
 *                         successfulInvitations:
 *                           type: integer
 *                         totalReward:
 *                           type: integer
 */
router.get('/invitation/history', authenticateToken, followController.getInvitationHistory);

module.exports = router;