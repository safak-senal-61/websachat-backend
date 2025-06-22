// src/routes/chatRoom/message.routes.js
const express = require('express');
const router = express.Router();
const chatRoomController = require('../../controllers/chatRoom');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /chatrooms/{roomId}/messages:
 *   get:
 *     summary: Belirli bir odadaki mesajları listeler
 *     tags: [ChatRooms, Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Oda mesajları başarıyla listelendi.
 */
router.get('/:roomId/messages', authenticateToken, chatRoomController.getRoomMessages);

/**
 * @swagger
 * /chatrooms/{roomId}/messages:
 *   post:
 *     summary: Belirli bir odaya yeni bir mesaj gönderir
 *     tags: [ChatRooms, Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MessagePostRequest'
 *     responses:
 *       201:
 *         description: Mesaj başarıyla gönderildi.
 */
router.post('/:roomId/messages', authenticateToken, chatRoomController.postMessageToRoom);

module.exports = router;
