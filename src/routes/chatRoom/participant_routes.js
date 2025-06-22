// src/routes/chatRoom/participant.routes.js
const express = require('express');
const router = express.Router();
const chatRoomController = require('../../controllers/chatRoom');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /chatrooms/{roomId}/join:
 *   post:
 *     summary: Bir sohbet odasına katılır
 *     tags: [ChatRooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoomJoinRequest'
 *     responses:
 *       200:
 *         description: Odaya başarıyla katıldınız.
 */
router.post('/:roomId/join', authenticateToken, chatRoomController.joinChatRoom);

/**
 * @swagger
 * /chatrooms/{roomId}/leave:
 *   post:
 *     summary: Bir sohbet odasından ayrılır
 *     tags: [ChatRooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Odadan başarıyla ayrıldınız.
 */
router.post('/:roomId/leave', authenticateToken, chatRoomController.leaveChatRoom);

module.exports = router;