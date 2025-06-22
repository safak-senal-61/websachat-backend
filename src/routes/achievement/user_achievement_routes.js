// src/routes/achievement/user_achievement_routes.js
const express = require('express');
const router = express.Router();
const achievementController = require('../../controllers/achievement');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /users/{userId}/achievements:
 *   get:
 *     summary: "Belirli bir kullanıcının başarılarını listeler"
 *     tags: [User Achievements]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Kullanıcının başarıları başarıyla listelendi"
 *       '404':
 *         description: "Kullanıcı bulunamadı"
 */
router.get('/users/:userId/achievements', achievementController.getUserAchievements);

/**
 * @swagger
 * /user/achievements:
 *   get:
 *     summary: "Giriş yapmış kullanıcının başarılarını listeler"
 *     tags: [User Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Kullanıcının başarıları başarıyla listelendi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 */
router.get('/user/achievements', authenticateToken, achievementController.getMyAchievements);

/**
 * @swagger
 * /user/achievements/progress:
 *   get:
 *     summary: "Giriş yapmış kullanıcının başarı ilerlemesini getirir"
 *     tags: [User Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Kullanıcının başarı ilerlemesi başarıyla getirildi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 */
router.get('/user/achievements/progress', authenticateToken, achievementController.getUserProgress);

module.exports = router;