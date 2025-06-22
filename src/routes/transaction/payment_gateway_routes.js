// src/routes/transaction/payment_gateway_routes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../../controllers/transaction');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /transactions/purchase/coins:
 *   post:
 *     summary: "Jeton satın alma işlemini başlatır ve Iyzico ödeme formunu döndürür"
 *     tags: 
 *       - Transactions
 *       - Payments
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/InitiateCoinPurchaseRequest"
 *     responses:
 *       200:
 *         description: "Iyzico ödeme formu başarıyla oluşturuldu."
 */
router.post('/purchase/coins', authenticateToken, transactionController.initiateCoinPurchase);

/**
 * @swagger
 * /transactions/callback/iyzico:
 *   post:
 *     summary: "Iyzico'dan gelen başarılı/başarısız ödeme sonucunu işler"
 *     description: "Bu endpoint, Iyzico tarafından çağrılır. Ödeme sonucunu doğrular ve işlemi tamamlar."
 *     tags: 
 *       - Transactions
 *       - Payments
 *       - Webhooks
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       302:
 *         description: "İşlem sonrası kullanıcıyı frontend'e yönlendirir."
 */
// Iyzico POST ile form verisi gönderdiği için urlencoded middleware'i gerekir.
// Bu middleware'i ana app.js dosyanıza eklediğiniz için burada tekrar gerekmez.
router.post('/callback/iyzico', transactionController.handleIyzicoCallback);

// Stripe gibi diğer sağlayıcılar için webhook rotanız kalabilir
router.post('/webhooks/payment', express.raw({type: 'application/json'}), transactionController.handlePaymentWebhook);

module.exports = router;