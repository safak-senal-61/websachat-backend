// src/routes/gift/history_routes.js
const express = require('express');
const router = express.Router();
const giftController = require('../../controllers/gift');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /gifts/history/sent:
 *   get:
 *     summary: Giriş yapmış kullanıcının gönderdiği hediyeleri listeler
 *     tags: [Gifts, User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *     responses:
 *       200:
 *         description: Gönderilen hediyeler listelendi.
 */
router.get('/history/sent', authenticateToken, giftController.getMySentGifts);

/**
 * @swagger
 * /gifts/history/received:
 *   get:
 *     summary: Giriş yapmış kullanıcının aldığı hediyeleri listeler
 *     tags: [Gifts, User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *     responses:
 *       200:
 *         description: Alınan hediyeler listelendi.
 */
router.get('/history/received', authenticateToken, giftController.getMyReceivedGifts);

module.exports = router;