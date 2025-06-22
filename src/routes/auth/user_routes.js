// src/routes/auth/user_routes.js
const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: "Giriş yapmış kullanıcının kendi profil bilgilerini getirir."
 *     tags: [Auth, User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Kullanıcı bilgileri başarıyla getirildi."
 *       '401':
 *         description: "Yetkisiz erişim."
 */
router.get('/me', authenticateToken, authController.getMe);

/**
 * @swagger
 * /auth/sessions:
 *   get:
 *     summary: "Kullanıcının aktif oturumlarını listeler."
 *     tags: [Auth, User, Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Aktif oturumlar başarıyla listelendi."
 *       '401':
 *         description: "Yetkisiz erişim."
 */
router.get('/sessions', authenticateToken, authController.getActiveSessions);

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     summary: "Mevcut oturum hariç diğer tüm oturumları sonlandırır."
 *     tags: [Auth, User, Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Diğer oturumlar başarıyla sonlandırıldı."
 *       '401':
 *         description: "Yetkisiz erişim."
 */
router.post('/logout-all', authenticateToken, authController.logoutAllDevices);

module.exports = router;