// src/routes/userSettings/security_routes.js
const express = require('express');
const router = express.Router();
const userSettingsController = require('../../controllers/userSettings');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /settings/password:
 *   put:
 *     summary: "Giriş yapmış kullanıcının şifresini günceller."
 *     tags: [UserSettings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: "Şifre başarıyla güncellendi."
 */
router.put('/password', authenticateToken, userSettingsController.updatePassword);

/**
 * @swagger
 * /settings/email/request-change:
 *   post:
 *     summary: "E-posta değişikliği talebi başlatır ve doğrulama linki gönderir."
 *     tags: [UserSettings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEmail
 *               - password
 *             properties:
 *               newEmail:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: "Doğrulama linki yeni e-posta adresine gönderildi."
 */
router.post('/email/request-change', authenticateToken, userSettingsController.requestEmailChange);

/**
 * @swagger
 * /settings/email/verify-change:
 *   get:
 *     summary: "Yeni e-posta adresini doğrular ve günceller."
 *     tags: [UserSettings]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "E-posta başarıyla güncellendi."
 */
// Bu endpoint authenticateToken kullanmaz çünkü kullanıcı linke tıkladığında login olmayabilir.
router.get('/email/verify-change', userSettingsController.verifyNewEmail);

module.exports = router;