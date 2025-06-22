
// src/routes/chatRoom/moderation.routes.js
const express = require('express');
const router = express.Router();
const chatRoomController = require('../../controllers/chatRoom');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /chatrooms/{roomId}/moderators/{targetUserId}:
 *   post:
 *     summary: Bir kullanıcıyı odaya moderatör olarak ekler (Sadece sahip)
 *     tags: [ChatRooms, Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kullanıcı başarıyla moderatör olarak eklendi.
 */
router.post('/:roomId/moderators/:targetUserId', authenticateToken, chatRoomController.addModerator);

/**
 * @swagger
 * /chatrooms/{roomId}/moderators/{targetUserId}:
 *   delete:
 *     summary: Bir kullanıcıyı moderatörlükten çıkarır (Sadece sahip)
 *     tags: [ChatRooms, Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kullanıcı moderatörlükten başarıyla çıkarıldı.
 */
router.delete('/:roomId/moderators/:targetUserId', authenticateToken, chatRoomController.removeModerator);

module.exports = router;