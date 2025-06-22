// src/routes/subscription/plan_routes.js
const express = require('express');
const router = express.Router();
const subscriptionController = require('../../controllers/subscription');
const { authenticateToken, authorizeRoles } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /plans:
 *   get:
 *     summary: "Tüm abonelik planlarını listeler"
 *     tags: [Subscription Plans]
 *     responses:
 *       '200':
 *         description: "Abonelik planları başarıyla listelendi"
 */
router.get('/plans', subscriptionController.listSubscriptionPlans);

/**
 * @swagger
 * /plans/{planId}:
 *   get:
 *     summary: "Belirli bir abonelik planının detaylarını getirir"
 *     tags: [Subscription Plans]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Abonelik planı detayları başarıyla getirildi"
 *       '404':
 *         description: "Abonelik planı bulunamadı"
 */
router.get('/plans/:planId', subscriptionController.getSubscriptionPlanById);

/**
 * @swagger
 * /plans:
 *   post:
 *     summary: "Yeni bir abonelik planı oluşturur (Admin)"
 *     tags: [Subscription Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - duration
 *               - features
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *               duration:
 *                 type: integer
 *               durationUnit:
 *                 type: string
 *                 enum: [DAY, WEEK, MONTH, YEAR]
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       '201':
 *         description: "Abonelik planı başarıyla oluşturuldu"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 */
router.post('/plans', authenticateToken, authorizeRoles('ADMIN'), subscriptionController.createSubscriptionPlan);

/**
 * @swagger
 * /plans/{planId}:
 *   put:
 *     summary: "Bir abonelik planını günceller (Admin)"
 *     tags: [Subscription Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *               duration:
 *                 type: integer
 *               durationUnit:
 *                 type: string
 *                 enum: [DAY, WEEK, MONTH, YEAR]
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       '200':
 *         description: "Abonelik planı başarıyla güncellendi"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Abonelik planı bulunamadı"
 */
router.put('/plans/:planId', authenticateToken, authorizeRoles('ADMIN'), subscriptionController.updateSubscriptionPlan);

/**
 * @swagger
 * /plans/{planId}:
 *   delete:
 *     summary: "Bir abonelik planını siler (Admin)"
 *     tags: [Subscription Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Abonelik planı başarıyla silindi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Abonelik planı bulunamadı"
 */
router.delete('/plans/:planId', authenticateToken, authorizeRoles('ADMIN'), subscriptionController.deleteSubscriptionPlan);

module.exports = router;