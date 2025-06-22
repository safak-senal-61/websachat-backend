// src/routes/twoFactor/verification_routes.js
const express = require('express');
const router = express.Router();
const twoFactorController = require('../../controllers/twoFactor');

/**
 * @swagger
 * /2fa/verify-login:
 *   post:
 *     summary: "Login işlemi sırasında (şifre doğrulandıktan sonra) 2FA kodunu doğrular."
 *     tags: 
 *       - TwoFactorAuth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: "2FA kodu doğrulandı. Login işlemi tamamlandı."
 */
router.post('/verify-login', twoFactorController.verifyLoginTwoFactor);

/**
 * @swagger
 * /2fa/verify-backup-code:
 *   post:
 *     summary: "Login sırasında 2FA yerine yedek kodu doğrular."
 *     tags: 
 *       - TwoFactorAuth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               backupCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: "Yedek kod doğrulandı. Login işlemi tamamlandı."
 */
router.post('/verify-backup-code', twoFactorController.verifyWithBackupCode);

module.exports = router;