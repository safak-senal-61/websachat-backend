// src/routes/auth/email_routes.js
const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth');

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: "E-posta doğrulama token'ını kullanarak e-postayı doğrular."
 *     tags: [Auth, Email]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "E-posta başarıyla doğrulandı."
 */
router.get('/verify-email', authController.verifyEmail);

/**
 * @swagger
 * /auth/resend-verification-email:
 *   post:
 *     summary: "Yeni bir e-posta doğrulama linki gönderir."
 *     tags: [Auth, Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       '200':
 *         description: "Doğrulama e-postası tekrar gönderildi."
 */
router.post('/resend-verification-email', authController.resendVerificationEmail);

module.exports = router;

// =====================================
