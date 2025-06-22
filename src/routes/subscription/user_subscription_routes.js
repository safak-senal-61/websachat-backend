// src/routes/subscription/user_subscription_routes.js
const express = require('express');
const router = express.Router();
const subscriptionController = require('../../controllers/subscription');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /subscribe:
 *   post:
 *     summary: "Bir abonelik başlatır"
 *     tags: [User Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - paymentMethod
 *             properties:
 *               planId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [CREDIT_CARD, PAYPAL, CRYPTO, BANK_TRANSFER]
 *               paymentDetails:
 *                 type: object
 *     responses:
 *       '200':
 *         description: "Abonelik başlatma işlemi başarılı"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Abonelik planı bulunamadı"
 */
router.post('/subscribe', authenticateToken, subscriptionController.initiateSubscription);

/**
 * @swagger
 * /callback:
 *   post:
 *     summary: "Ödeme sistemi callback"
 *     tags: [User Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: "Callback başarıyla işlendi"
 *       '400':
 *         description: "Geçersiz istek"
 */
router.post('/callback', subscriptionController.subscriptionCallback);

/**
 * @swagger
 * /active:
 *   get:
 *     summary: "Giriş yapmış kullanıcının aktif aboneliğini getirir"
 *     tags: [User Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Aktif abonelik başarıyla getirildi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Aktif abonelik bulunamadı"
 */
router.get('/active', authenticateToken, subscriptionController.getActiveSubscription);

/**
 * @swagger
 * /history:
 *   get:
 *     summary: "Giriş yapmış kullanıcının abonelik geçmişini getirir"
 *     tags: [User Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Abonelik geçmişi başarıyla getirildi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 */
router.get('/history', authenticateToken, subscriptionController.getSubscriptionHistory);

/**
 * @swagger
 * /cancel/{subscriptionId}:
 *   post:
 *     summary: "Bir aboneliği iptal eder"
 *     tags: [User Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Abonelik başarıyla iptal edildi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Abonelik bulunamadı"
 */
router.post('/cancel/:subscriptionId', authenticateToken, subscriptionController.cancelSubscription);

/**
 * @swagger
 * /renew/{subscriptionId}:
 *   post:
 *     summary: "Bir aboneliği yeniler"
 *     tags: [User Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Abonelik başarıyla yenilendi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Abonelik bulunamadı"
 */
router.post('/renew/:subscriptionId', authenticateToken, subscriptionController.renewSubscription);

module.exports = router;