// src/routes/gift/management_routes.js
const express = require('express');
const router = express.Router();
const giftController = require('../../controllers/gift');
const { authenticateToken, isAdmin } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /gifts:
 *   post:
 *     summary: Yeni bir hediye türü oluşturur (Sadece Admin)
 *     tags: [Gifts, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GiftCreateRequest'
 *     responses:
 *       201:
 *         description: Hediye oluşturuldu.
 */
router.post('/', authenticateToken, isAdmin, giftController.createGift);

/**
 * @swagger
 * /gifts:
 *   get:
 *     summary: Tüm (aktif) hediyeleri listeler
 *     tags: [Gifts]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hediyeler listelendi.
 */
router.get('/', giftController.listGifts);

/**
 * @swagger
 * /gifts/{giftModelId}:
 *   get:
 *     summary: Belirli bir hediyenin detaylarını getirir
 *     tags: [Gifts]
 *     parameters:
 *       - $ref: '#/components/parameters/GiftModelIdPathParam'
 *     responses:
 *       200:
 *         description: Hediye detayı getirildi.
 */
router.get('/:giftModelId', giftController.getGiftById);

/**
 * @swagger
 * /gifts/{giftModelId}:
 *   put:
 *     summary: Mevcut bir hediyeyi günceller (Sadece Admin)
 *     tags: [Gifts, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GiftModelIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GiftUpdateRequest'
 *     responses:
 *       200:
 *         description: Hediye güncellendi.
 */
router.put('/:giftModelId', authenticateToken, isAdmin, giftController.updateGift);

/**
 * @swagger
 * /gifts/{giftModelId}:
 *   delete:
 *     summary: Bir hediyeyi siler veya pasif hale getirir (Sadece Admin)
 *     tags: [Gifts, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GiftModelIdPathParam'
 *     responses:
 *       200:
 *         description: Hediye silindi/pasif edildi.
 */
router.delete('/:giftModelId', authenticateToken, isAdmin, giftController.deleteGift);

module.exports = router;