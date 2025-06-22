// src/routes/message/room_features_routes.js
const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/message');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /messages/room/{roomId}/pin/{messageId}:
 *   post:
 *     summary: Bir odada bir mesajı sabitler (Yönetici/Sahip)
 *     tags: [Messages, ChatRooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roomId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: messageId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Mesaj başarıyla sabitlendi."
 */
router.post('/room/:roomId/pin/:messageId', authenticateToken, messageController.pinMessageInRoom);

/**
 * @swagger
 * /messages/room/{roomId}/unpin/{messageId}:
 *   delete:
 *     summary: Bir odadaki mesajın sabitlemesini kaldırır (Yönetici/Sahip)
 *     tags: [Messages, ChatRooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roomId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: messageId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Mesaj sabitlemesi kaldırıldı."
 */
router.delete('/room/:roomId/unpin/:messageId', authenticateToken, messageController.unpinMessageInRoom);

/**
 * @swagger
 * /messages/room/{roomId}/pinned:
 *   get:
 *     summary: Bir odadaki sabitlenmiş mesajları listeler
 *     tags: [Messages, ChatRooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roomId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Sabitlenmiş mesajlar listelendi."
 */
router.get('/room/:roomId/pinned', authenticateToken, messageController.getPinnedMessagesInRoom);

module.exports = router;