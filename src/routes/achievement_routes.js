// src/routes/achievement_routes.js
const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievement');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Başarı yönetimi rotaları
router.get('/achievements', achievementController.listAchievements);
router.get('/achievements/:achievementId', achievementController.getAchievementById);
router.post('/achievements', authenticateToken, authorizeRoles('ADMIN', 'MODERATOR'), achievementController.createAchievement);
router.put('/achievements/:achievementId', authenticateToken, authorizeRoles('ADMIN', 'MODERATOR'), achievementController.updateAchievement);
router.delete('/achievements/:achievementId', authenticateToken, authorizeRoles('ADMIN', 'MODERATOR'), achievementController.deleteAchievement);

// Kullanıcı başarıları rotaları
router.get('/users/:userId/achievements', achievementController.getUserAchievements);
router.get('/user/achievements', authenticateToken, achievementController.getMyAchievements);
router.get('/user/achievements/progress', authenticateToken, achievementController.getUserProgress);

module.exports = router;