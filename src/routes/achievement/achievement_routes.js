// src/routes/achievement/achievement_routes.js
const express = require('express');
const router = express.Router();
const achievementController = require('../../controllers/achievement');
const { authenticateToken, authorizeRoles } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /achievements:
 *   get:
 *     summary: "Tüm başarıları listeler"
 *     tags: [Achievements]
 *     responses:
 *       '200':
 *         description: "Başarılar başarıyla listelendi"
 */
router.get('/achievements', achievementController.listAchievements);

/**
 * @swagger
 * /achievements/{achievementId}:
 *   get:
 *     summary: "Belirli bir başarının detaylarını getirir"
 *     tags: [Achievements]
 *     parameters:
 *       - in: path
 *         name: achievementId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Başarı detayları başarıyla getirildi"
 *       '404':
 *         description: "Başarı bulunamadı"
 */
router.get('/achievements/:achievementId', achievementController.getAchievementById);

/**
 * @swagger
 * /achievements:
 *   post:
 *     summary: "Yeni bir başarı oluşturur (Admin/Moderatör)"
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - type
 *               - requirement
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [GAME_PLAY, TOURNAMENT, SOCIAL, SPECIAL]
 *               requirement:
 *                 type: object
 *               points:
 *                 type: integer
 *               iconUrl:
 *                 type: string
 *     responses:
 *       '201':
 *         description: "Başarı başarıyla oluşturuldu"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 */
router.post('/achievements', authenticateToken, authorizeRoles('ADMIN', 'MODERATOR'), achievementController.createAchievement);

/**
 * @swagger
 * /achievements/{achievementId}:
 *   put:
 *     summary: "Bir başarıyı günceller (Admin/Moderatör)"
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: achievementId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [GAME_PLAY, TOURNAMENT, SOCIAL, SPECIAL]
 *               requirement:
 *                 type: object
 *               points:
 *                 type: integer
 *               iconUrl:
 *                 type: string
 *     responses:
 *       '200':
 *         description: "Başarı başarıyla güncellendi"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Başarı bulunamadı"
 */
router.put('/achievements/:achievementId', authenticateToken, authorizeRoles('ADMIN', 'MODERATOR'), achievementController.updateAchievement);

/**
 * @swagger
 * /achievements/{achievementId}:
 *   delete:
 *     summary: "Bir başarıyı siler (Admin/Moderatör)"
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: achievementId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Başarı başarıyla silindi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Başarı bulunamadı"
 */
router.delete('/achievements/:achievementId', authenticateToken, authorizeRoles('ADMIN', 'MODERATOR'), achievementController.deleteAchievement);

module.exports = router;