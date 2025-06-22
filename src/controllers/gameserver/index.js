// src/controllers/gameserver/index.js
const gameServerController = require('./gameserver_controller');

module.exports = {
    // Sunucu yönetimi
    listGameServers: gameServerController.listGameServers,
    getGameServerById: gameServerController.getGameServerById,
    createGameServer: gameServerController.createGameServer,
    updateGameServer: gameServerController.updateGameServer,
    deleteGameServer: gameServerController.deleteGameServer,
    updateServerStatus: gameServerController.updateServerStatus,
    checkServerHealth: gameServerController.checkServerHealth,
    
    // Oturum yönetimi
    listServerSessions: gameServerController.listServerSessions,
    startServerSession: gameServerController.startServerSession,
    endServerSession: gameServerController.endServerSession,
    
    // Oyuncu yönetimi
    addPlayerToSession: gameServerController.addPlayerToSession,
    removePlayerFromSession: gameServerController.removePlayerFromSession,
    listSessionPlayers: gameServerController.listSessionPlayers
};