// src/routes/userSettings/profile_routes.js
const express = require('express');
const router = express.Router();
const userSettingsController = require('../../controllers/userSettings');

/**
 * @swagger
 * /settings/profile:
 *   put:
 *     summary: "Giriş yapmış kullanıcının profil bilgilerini günceller."
 *     tags: [UserSettings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *               profilePictureUrl:
 *                 type: string
 *                 format: url
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: "Profil başarıyla güncellendi."
 */
router.put('/profile', userSettingsController.updateProfile);

module.exports = router;