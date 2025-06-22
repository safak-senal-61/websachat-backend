// src/routes/userSettings/account_routes.js
const express = require('express');
const router = express.Router();
const userSettingsController = require('../../controllers/userSettings');

/**
 * @swagger
 * /settings/account/deactivate:
 *   post:
 *     summary: "Hesabını geçici olarak devre dışı bırakır."
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
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: "Hesap başarıyla geçici olarak kapatıldı."
 */
router.post('/account/deactivate', userSettingsController.deactivateAccount);

/**
 * @swagger
 * /settings/account/delete:
 *   post:
 *     summary: "Hesabını kalıcı olarak siler."
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
 *               - password
 *               - confirmation
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *               confirmation:
 *                 type: string
 *                 example: "HESABIMI KALICI OLARAK SİL"
 *     responses:
 *       200:
 *         description: "Hesap başarıyla kalıcı olarak silindi."
 */
router.post('/account/delete', userSettingsController.deleteAccount);

module.exports = router;