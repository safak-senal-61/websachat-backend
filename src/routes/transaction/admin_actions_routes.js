// src/routes/transaction/admin_actions_routes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../../controllers/transaction');
const { authenticateToken, isAdmin } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: "Yeni bir işlem oluşturur (Admin veya sistem tarafından)"
 *     tags: 
 *       - Transactions
 *       - Admin
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/TransactionCreateRequest"
 *     responses:
 *       201:
 *         description: "İşlem başarıyla oluşturuldu."
 */
router.post('/', authenticateToken, isAdmin, transactionController.createTransactionRecord);

/**
 * @swagger
 * /transactions/user/{userId}:
 *   get:
 *     summary: "Belirli bir kullanıcının işlemlerini listeler (Admin)"
 *     tags: 
 *       - Transactions
 *       - Admin
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/UserIdPathParamForTransaction"
 *     responses:
 *       200:
 *         description: "Kullanıcının işlemleri listelendi."
 */
router.get('/user/:userId', authenticateToken, isAdmin, transactionController.getUserTransactions);

/**
 * @swagger
 * /transactions/{transactionId}:
 *   get:
 *     summary: "Belirli bir işlemin detaylarını getirir"
 *     tags: 
 *       - Transactions
 *       - Admin
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/TransactionIdPathParam"
 *     responses:
 *       200:
 *         description: "İşlem detayları getirildi."
 */
router.get('/:transactionId', authenticateToken, transactionController.getTransactionById); // Admin'e de açık olmalı

/**
 * @swagger
 * /transactions/{transactionId}/status:
 *   put:
 *     summary: "Bir işlemin durumunu günceller (Admin)"
 *     tags: 
 *       - Transactions
 *       - Admin
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/TransactionIdPathParam"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/TransactionStatusUpdateRequest"
 *     responses:
 *       200:
 *         description: "İşlem durumu güncellendi."
 */
router.put('/:transactionId/status', authenticateToken, isAdmin, transactionController.updateTransactionStatusByAdmin);

/**
 * @swagger
 * /transactions/{transactionId}/refund:
 *   post:
 *     summary: "Bir işlemi iade eder (Admin)"
 *     tags: 
 *       - Transactions
 *       - Admin
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/TransactionIdPathParam"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RefundRequest"
 *     responses:
 *       200:
 *         description: "İşlem iade edildi."
 */
router.post('/:transactionId/refund', authenticateToken, isAdmin, transactionController.refundTransaction);

/**
 * @swagger
 * /transactions/report:
 *   get:
 *     summary: "Filtrelenmiş işlem raporu oluşturur (Admin)"
 *     tags: 
 *       - Transactions
 *       - Admin
 *       - Reports
 *     security: 
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Rapor oluşturuldu."
 */
router.get('/report', authenticateToken, isAdmin, transactionController.getTransactionReport);

module.exports = router;