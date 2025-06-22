// src/routes/userPreferences/privacy_routes.js
const express = require('express');
const router = express.Router();
const userPreferencesController = require('../../controllers/userPreferences');

/**
 * @swagger
 * /preferences/account/visibility:
 *   put:
 *     summary: "Hesap gizlilik durumunu ayarlar (Herkese Açık/Gizli)."
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
 *               isPrivate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: "Hesap gizlilik ayarı güncellendi."
 *   get:
 *     summary: "Mevcut hesap gizlilik durumunu getirir."
 *     tags: 
 *       - UserPreferences
 *     security: 
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Hesap gizlilik durumu."
 */
router.route('/account/visibility')
  .put(userPreferencesController.setAccountVisibility)
  .get(userPreferencesController.getAccountVisibility);

/**
 * @swagger
 * /preferences/activity-status/visibility:
 *   put:
 *     summary: "Çevrimiçi/aktivite durumu görünürlüğünü ayarlar."
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
 *               visibility:
 *                 type: string
 *                 enum: 
 *                   - "EVERYONE"
 *                   - "FOLLOWERS"
 *                   - "NOBODY"
 *     responses:
 *       200:
 *         description: "Aktivite durumu görünürlük ayarı güncellendi."
 *   get:
 *     summary: "Mevcut çevrimiçi/aktivite durumu görünürlük ayarını getirir."
 *     tags: 
 *       - UserPreferences
 *     security: 
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Aktivite durumu görünürlük ayarı."
 */
router.route('/activity-status/visibility')
  .put(userPreferencesController.setActivityStatusVisibility)
  .get(userPreferencesController.getActivityStatusVisibility);

module.exports = router;