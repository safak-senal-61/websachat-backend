// src/routes/message/actions_routes.js
const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/message');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /messages/conversation/{conversationId}:
 *   get:
 *     summary: Belirli bir sohbetteki mesajları listeler
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *     responses:
 *       200:
 *         description: "Mesajlar başarıyla listelendi."
 */
router.get('/conversation/:conversationId', authenticateToken, messageController.getMessagesByConversation);

/**
 * @swagger
 * /messages/conversation/{conversationId}:
 *   post:
 *     summary: Belirli bir sohbete yeni mesaj gönderir
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: conversationId
 *         in: path
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
 *         description: "Mesaj başarıyla gönderildi."
 */
router.post('/conversation/:conversationId', authenticateToken, messageController.createMessage);

/**
 * @swagger
 * /messages/{messageId}:
 *   put:
 *     summary: Belirli bir mesajı günceller (Sadece gönderen)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: messageId
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
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: "Mesaj başarıyla güncellendi."
 */
router.put('/:messageId', authenticateToken, messageController.updateMessage);

/**
 * @swagger
 * /messages/{messageId}:
 *   delete:
 *     summary: Belirli bir mesajı siler
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: messageId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: forMeOnly
 *         in: query
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: "Mesaj başarıyla silindi."
 */
router.delete('/:messageId', authenticateToken, messageController.deleteMessage);

module.exports = router;