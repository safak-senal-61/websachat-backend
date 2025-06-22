// src/routes/auth/password_routes.js

const express = require('express');
const router = express.Router();
// Controller'ların ana birleştiricisini doğru yoldan çağırıyoruz.
const authController = require('../../controllers/auth');

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: "Şifre sıfırlama talimatları içeren bir e-posta gönderir."
 *     tags: [Auth, Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "kullanici@example.com"
 *             required:
 *               - email
 *     responses:
 *       '200':
 *         description: "Eğer e-posta kayıtlıysa, şifre sıfırlama linki gönderilmiştir."
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /auth/validate-reset-token:
 *   get:
 *     summary: "Sağlanan şifre sıfırlama token'ının geçerliliğini kontrol eder."
 *     tags: [Auth, Password]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: "Kontrol edilecek şifre sıfırlama token'ı."
 *     responses:
 *       '200':
 *         description: "Token geçerli."
 */
router.get('/validate-reset-token', authController.validatePasswordResetToken);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: "Sağlanan bir token ve yeni şifre ile kullanıcının şifresini sıfırlar."
 *     tags: [Auth, Password]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: "E-posta ile gönderilen şifre sıfırlama token'ı."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "YeniGucluSifre123!"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "YeniGucluSifre123!"
 *             required:
 *               - password
 *               - confirmPassword
 *     responses:
 *       '200':
 *         description: "Şifre başarıyla sıfırlandı."
 */
router.post('/reset-password', authController.resetPassword);

module.exports = router;