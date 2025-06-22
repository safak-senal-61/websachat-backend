// src/routes/message/state_routes.js
const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/message');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /messages/{messageId}/read:
 *   post:
 *     summary: Bir mesajı okundu olarak işaretler
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: messageId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Mesaj okundu olarak işaretlendi."
 */
router.post('/:messageId/read', authenticateToken, messageController.markMessageAsRead);

/**
 * @swagger
 * /messages/{messageId}/react:
 *   post:
 *     summary: Bir mesaja reaksiyon ekler veya kaldırır
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
 *               reactionEmoji:
 *                 type: string
 *     responses:
 *       200:
 *         description: "Reaksiyon başarıyla işlendi."
 */
router.post('/:messageId/react', authenticateToken, messageController.reactToMessage);

module.exports = router;