// src/routes/auth/standard_routes.js
const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: "Bir kullanıcıyı giriş yaptırır ve token oluşturur."
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loginIdentifier
 *               - password
 *             properties:
 *               loginIdentifier:
 *                 type: string
 *                 description: "Kullanıcı adı veya e-posta"
 *               password:
 *                 type: string
 *                 format: password
 *               twoFactorToken:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       '200':
 *         description: "Giriş başarılı."
 *       '401':
 *         description: "Geçersiz kimlik bilgileri."
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: "Yenileme token'ını kullanarak erişim token'ını yeniler."
 *     tags: [Auth]
 *     responses:
 *       '200':
 *         description: "Token başarıyla yenilendi."
 *       '401':
 *         description: "Yenileme token'ı geçersiz."
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: "Kullanıcının oturumunu sonlandırır."
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Çıkış başarılı."
 */
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;

// =====================================