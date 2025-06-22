// src/controllers/game/session_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

exports.getGameSessionsForGame = async (req, res) => {
    const { gameModelId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    try {
        const sessions = await prisma.gameSession.findMany({
            where: { gameId: gameModelId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit),
            include: { host: { select: { id: true, username: true, nickname: true } } }
        });
        const totalSessions = await prisma.gameSession.count({ where: { gameId: gameModelId } });
        return Response.ok(res, `Oyuna ait oturumlar listelendi.`, {
            oturumlar: sessions,
            meta: { toplamOturum: totalSessions, suankiSayfa: parseInt(page), toplamSayfa: Math.ceil(totalSessions / limit) }
        });
    } catch (error) {
        console.error(`Oyun oturumlarını listeleme hatası:`, error);
        return Response.internalServerError(res, "Oturumlar listelenirken bir hata oluştu.");
    }
};
