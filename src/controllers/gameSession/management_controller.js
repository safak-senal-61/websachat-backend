// src/controllers/gameSession/management_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

const GAME_SESSION_STATUS = { WAITING: 'WAITING' };

exports.createGameSession = async (req, res) => {
    const { gameId, maxPlayers } = req.body;
    const hostId = req.user.userId;

    if (!gameId || !maxPlayers) {
        return Response.badRequest(res, 'Oyun ID ve maksimum oyuncu sayısı zorunludur.');
    }
    const nMaxPlayers = parseInt(maxPlayers, 10);
    if (isNaN(nMaxPlayers) || nMaxPlayers <= 0) {
        return Response.badRequest(res, "Maksimum oyuncu sayısı geçerli bir pozitif tamsayı olmalıdır.");
    }

    try {
        const game = await prisma.game.findUnique({ where: { id: gameId } });
        if (!game || !game.isActive) {
            return Response.notFound(res, "Oyun bulunamadı veya aktif değil.");
        }

        const newSession = await prisma.gameSession.create({
            data: {
                gameId,
                hostId,
                maxPlayers: nMaxPlayers,
                status: GAME_SESSION_STATUS.WAITING,
                participants: [hostId],
                currentPlayers: 1,
            },
            include: {
                game: { select: { id: true, name: true, iconUrl: true } },
                host: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } }
            }
        });
        return Response.created(res, 'Oyun oturumu başarıyla oluşturuldu.', { oturum: newSession });
    } catch (error) {
        console.error("Oyun oturumu oluşturma hatası:", error);
        return Response.internalServerError(res, 'Oyun oturumu oluşturulurken bir hata oluştu.');
    }
};

exports.listGameSessions = async (req, res) => {
    const { page = 1, limit = 10, gameId, hostId, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const whereConditions = {};
    if (gameId) whereConditions.gameId = gameId;
    if (hostId) whereConditions.hostId = hostId;
    if (status) whereConditions.status = status.toUpperCase();

    try {
        const sessions = await prisma.gameSession.findMany({
            where: whereConditions,
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit),
            include: {
                game: { select: { id: true, name: true, iconUrl: true } },
                host: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } }
            }
        });
        const totalSessions = await prisma.gameSession.count({ where: whereConditions });

        return Response.ok(res, 'Oyun oturumları listelendi.', {
            oturumlar: sessions,
            meta: {
                toplamOturum: totalSessions,
                suankiSayfa: parseInt(page),
                toplamSayfa: Math.ceil(totalSessions / parseInt(limit))
            }
        });
    } catch (error) {
        console.error("Oyun oturumlarını listeleme hatası:", error);
        return Response.internalServerError(res, 'Oturumlar listelenirken bir hata oluştu.');
    }
};

exports.getGameSessionById = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const session = await prisma.gameSession.findUnique({
            where: { id: sessionId },
            include: {
                game: true,
                host: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
            }
        });

        if (!session) {
            return Response.notFound(res, 'Oyun oturumu bulunamadı.');
        }
        return Response.ok(res, 'Oyun oturumu detayları getirildi.', { oturum: session });
    } catch (error) {
        console.error(`Oyun oturumu getirme hatası:`, error);
        return Response.internalServerError(res, 'Oturum detayları getirilirken bir hata oluştu.');
    }
};
