// src/routes/userPreferences/notification_routes.js
const express = require('express');
const router = express.Router();
const userPreferencesController = require('../../controllers/userPreferences');

/**
 * @swagger
 * /preferences/notifications:
 *   get:
 *     summary: "Kullanıcının tüm bildirim tercihlerini getirir."
 *     tags: 
 *       - UserPreferences
 *     security: 
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Bildirim tercihleri."
 *   put:
 *     summary: "Kullanıcının bildirim tercihlerini günceller (kısmi güncelleme)."
 *     tags: 
 *       - UserPreferences
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: "Sadece güncellenmek istenen bildirim kategorileri ve kanalları gönderilir."
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               likes:
 *                 email: true
 *                 push: false
 *               gameInvites:
 *                 push: true
 *     responses:
 *       200:
 *         description: "Bildirim tercihleri güncellendi."
 */
router.route('/notifications')
  .get(userPreferencesController.getNotificationPreferences)
  .put(userPreferencesController.updateNotificationPreferences);

module.exports = router;