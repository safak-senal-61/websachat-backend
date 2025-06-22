// src/controllers/tournament/index.js
const tournamentController = require('./tournament_controller');
const participantController = require('./participant_controller');
const matchController = require('./match_controller');

module.exports = {
    // Turnuva yönetimi
    createTournament: tournamentController.createTournament,
    listTournaments: tournamentController.listTournaments,
    getTournamentById: tournamentController.getTournamentById,
    registerForTournament: tournamentController.registerForTournament,
    generateTournamentMatches: tournamentController.generateTournamentMatches,
    updateMatchResult: tournamentController.updateMatchResult,
    
    // Katılımcı yönetimi
    listTournamentParticipants: participantController.listTournamentParticipants,
    withdrawFromTournament: participantController.withdrawFromTournament,
    getUserTournaments: participantController.getUserTournaments,
    getTournamentLeaderboard: participantController.getTournamentLeaderboard,
    
    // Maç yönetimi
    listTournamentMatches: matchController.listTournamentMatches,
    getMatchById: matchController.getMatchById,
    getUserMatches: matchController.getUserMatches,
    reportMatchResult: matchController.reportMatchResult,
    resolveMatchDispute: matchController.resolveMatchDispute
};