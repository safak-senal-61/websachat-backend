// src/routes/twoFactor/backup_codes_routes.js
const express = require('express');
const router = express.Router();
const twoFactorController = require('../../controllers/twoFactor');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /2fa/generate-backup-codes:
 *   post:
 *     summary: "Kullanıcı için yeni 2FA yedek kodları oluşturur."
 *     tags: 
 *       - TwoFactorAuth
 *     security: 
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Yedek kodlar başarıyla oluşturuldu."
 */
router.post('/generate-backup-codes', authenticateToken, twoFactorController.generateBackupCodes);

module.exports = router;