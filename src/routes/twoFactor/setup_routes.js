// src/routes/twoFactor/setup_routes.js
const express = require('express');
const router = express.Router();
const twoFactorController = require('../../controllers/twoFactor');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /2fa/enable-setup:
 *   post:
 *     summary: "Kullanıcı için 2FA kurulumunu başlatır ve QR kodu/secret döndürür."
 *     tags: 
 *       - TwoFactorAuth
 *     security: 
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "QR kodu ve secret başarıyla oluşturuldu."
 */
router.post('/enable-setup', authenticateToken, twoFactorController.enableTwoFactor_setup);

/**
 * @swagger
 * /2fa/enable-verify:
 *   post:
 *     summary: "Kullanıcının girdiği 2FA kodunu doğrular ve 2FA'yı aktifleştirir."
 *     tags: 
 *       - TwoFactorAuth
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               secret:
 *                 type: string
 *     responses:
 *       200:
 *         description: "2FA başarıyla aktifleştirildi."
 */
router.post('/enable-verify', authenticateToken, twoFactorController.enableTwoFactor_verify);

/**
 * @swagger
 * /2fa/disable:
 *   post:
 *     summary: "Kullanıcı için 2FA'yı devre dışı bırakır."
 *     tags: 
 *       - TwoFactorAuth
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               twoFactorCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: "2FA başarıyla devre dışı bırakıldı."
 */
router.post('/disable', authenticateToken, twoFactorController.disableTwoFactor);

module.exports = router;