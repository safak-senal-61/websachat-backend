// src/routes/gift/sending_routes.js
const express = require('express');
const router = express.Router();
const giftController = require('../../controllers/gift');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /gifts/{giftModelId}/send:
 *   post:
 *     summary: Belirli bir hediyeyi bir kullanıcıya veya odaya gönderir
 *     tags: [Gifts, UserActions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GiftModelIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendGiftRequest'
 *     responses:
 *       201:
 *         description: Hediye başarıyla gönderildi.
 *       402:
 *         description: Yetersiz jeton.
 */
router.post('/:giftModelId/send', authenticateToken, giftController.sendGift);

module.exports = router;