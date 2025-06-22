// src/routes/message/user_info_routes.js
const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/message');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /messages/unread-counts:
 *   get:
 *     summary: Kullanıcının sohbetlerindeki okunmamış mesaj sayılarını getirir
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Okunmamış mesaj sayıları getirildi."
 */
router.get('/unread-counts', authenticateToken, messageController.getUnreadMessageCounts);

module.exports = router;