// src/routes/follow/requests_routes.js
const express = require('express');
const router = express.Router();
const followController = require('../../controllers/follow');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /follows/requests/pending:
 *   get:
 *     summary: Bekleyen takip isteklerini listeler
 *     tags: [FollowRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bekleyen takip istekleri listelendi.
 */
router.get('/requests/pending', authenticateToken, followController.getPendingFollowRequests);

/**
 * @swagger
 * /follows/requests/{requestId}/respond:
 *   post:
 *     summary: Takip isteğini kabul/reddet
 *     tags: [FollowRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
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
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, reject]
 *     responses:
 *       200:
 *         description: İstek yanıtlandı.
 */
router.post('/requests/:requestId/respond', authenticateToken, followController.respondToFollowRequest);

/**
 * @swagger
 * /follows/requests/cancel/{targetUserId}:
 *   delete:
 *     summary: Gönderilen takip isteğini iptal et
 *     tags: [FollowRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: targetUserId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: İstek iptal edildi.
 */
router.delete('/requests/cancel/:targetUserId', authenticateToken, followController.cancelFollowRequest);

module.exports = router;