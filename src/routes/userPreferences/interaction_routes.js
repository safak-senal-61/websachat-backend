// src/routes/userPreferences/interaction_routes.js
const express = require('express');
const router = express.Router();
const userPreferencesController = require('../../controllers/userPreferences');

/**
 * @swagger
 * /preferences/messaging/direct-message-policy:
 *   put:
 *     summary: "Kimlerin direkt mesaj gönderebileceğini ayarlar."
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
 *               policy:
 *                 type: string
 *                 enum: 
 *                   - "EVERYONE"
 *                   - "FOLLOWERS_I_FOLLOW"
 *                   - "NOBODY"
 *     responses:
 *       200:
 *         description: "Direkt mesaj politikası güncellendi."
 *   get:
 *     summary: "Mevcut direkt mesaj politikasını getirir."
 *     tags: 
 *       - UserPreferences
 *     security: 
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Direkt mesaj politikası."
 */
router.route('/messaging/direct-message-policy')
    .put(userPreferencesController.setDirectMessagePolicy)
    .get(userPreferencesController.getDirectMessagePolicy);

/**
 * @swagger
 * /preferences/interactions/mention-policy:
 *   put:
 *     summary: "Kimlerin sizi gönderilerde etiketleyebileceğini ayarlar."
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
 *               policy:
 *                 type: string
 *                 enum: 
 *                   - "EVERYONE"
 *                   - "FOLLOWERS"
 *                   - "NOBODY"
 *     responses:
 *       200:
 *         description: "Etiketlenme politikası güncellendi."
 *   get:
 *     summary: "Mevcut etiketlenme politikasını getirir."
 *     tags: 
 *       - UserPreferences
 *     security: 
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Etiketlenme politikası."
 */
router.route('/interactions/mention-policy')
    .put(userPreferencesController.setMentionPolicy)
    .get(userPreferencesController.getMentionPolicy);

/**
 * @swagger
 * /preferences/content/sensitive-filter:
 *   put:
 *     summary: "Hassas içerik filtresini etkinleştirir/devre dışı bırakır."
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
 *               enable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: "Hassas içerik filtresi ayarı güncellendi."
 */
router.put('/content/sensitive-filter', userPreferencesController.setSensitiveContentFilter);

/**
 * @swagger
 * /preferences/gaming/invite-policy:
 *   put:
 *     summary: "Kimlerden oyun daveti alınabileceğini ayarlar."
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
 *               policy:
 *                 type: string
 *                 enum: 
 *                   - "EVERYONE"
 *                   - "FRIENDS"
 *                   - "NOBODY"
 *     responses:
 *       200:
 *         description: "Oyun daveti politikası güncellendi."
 */
router.put('/gaming/invite-policy', userPreferencesController.setGameInvitePolicy);

module.exports = router;