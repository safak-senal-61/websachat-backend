// src/controllers/matchmaking/index.js
const matchmakingController = require('./matchmaking_controller');

module.exports = {
    // Beceri seviyesi yönetimi
    updatePlayerSkill: matchmakingController.updatePlayerSkill,
    getPlayerSkill: matchmakingController.getPlayerSkill,
    getPlayerAllSkills: matchmakingController.getPlayerAllSkills,
    getMySkills: matchmakingController.getMySkills,
    getGameLeaderboard: matchmakingController.getGameLeaderboard,
    
    // Eşleştirme kuyruğu
    joinMatchmakingQueue: matchmakingController.joinMatchmakingQueue,
    leaveMatchmakingQueue: matchmakingController.leaveMatchmakingQueue,
    checkQueueStatus: matchmakingController.checkQueueStatus,
    
    // Özel oyun oturumları
    createCustomGameSession: matchmakingController.createCustomGameSession
};