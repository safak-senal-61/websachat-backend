// src/routes/transaction/user_actions_routes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../../controllers/transaction');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /transactions/me:
 *   get:
 *     summary: "Giriş yapmış kullanıcının kendi işlemlerini listeler"
 *     tags: 
 *       - Transactions
 *       - User
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Kullanıcının işlemleri listelendi."
 */
router.get('/me', authenticateToken, transactionController.getUserTransactions);

/**
 * @swagger
 * /transactions/balance/me:
 *   get:
 *     summary: "Giriş yapmış kullanıcının jeton ve elmas bakiyesini getirir"
 *     tags: 
 *       - Transactions
 *       - User
 *     security: 
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Bakiye bilgileri başarıyla getirildi."
 */
router.get('/balance/me', authenticateToken, transactionController.getUserBalance);

/**
 * @swagger
 * /transactions/convert/diamonds-to-coins:
 *   post:
 *     summary: "Kullanıcının elmaslarını jetona dönüştürür"
 *     tags: 
 *       - Transactions
 *       - User
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/DiamondConversionRequest"
 *     responses:
 *       200:
 *         description: "Elmaslar başarıyla jetona dönüştürüldü."
 */
router.post('/convert/diamonds-to-coins', authenticateToken, transactionController.convertDiamondsToCoins);

module.exports = router;