// src/routes/userPreferences/localization_routes.js
const express = require('express');
const router = express.Router();
const userPreferencesController = require('../../controllers/userPreferences');

/**
 * @swagger
 * /preferences/localization/language:
 *   put:
 *     summary: "Kullanıcının uygulama dilini ayarlar."
 *     tags: 
 *       - UserPreferences
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               languageCode:
 *                 type: string
 *                 example: "en"
 *     responses:
 *       200:
 *         description: "Dil tercihi güncellendi."
 *   get:
 *     summary: "Kullanıcının mevcut dil tercihini getirir."
 *     tags: 
 *       - UserPreferences
 *     security: 
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Dil tercihi."
 */
router.route('/localization/language')
  .put(userPreferencesController.setLanguagePreference)
  .get(userPreferencesController.getLanguagePreference);

module.exports = router;