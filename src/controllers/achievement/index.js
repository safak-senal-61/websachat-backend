// src/controllers/achievement/index.js
const achievementController = require('./achievement_controller');

module.exports = {
    // Başarı yönetimi
    listAchievements: achievementController.listAchievements,
    getAchievementById: achievementController.getAchievementById,
    createAchievement: achievementController.createAchievement,
    updateAchievement: achievementController.updateAchievement,
    deleteAchievement: achievementController.deleteAchievement,
    
    // Kullanıcı başarıları
    checkUserAchievements: achievementController.checkUserAchievements,
    getUserAchievements: achievementController.getUserAchievements,
    getMyAchievements: achievementController.getMyAchievements,
    getUserProgress: achievementController.getUserProgress
};