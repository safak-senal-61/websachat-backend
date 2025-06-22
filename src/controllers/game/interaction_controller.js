// src/controllers/game/interaction_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

exports.likeGame = async (req, res) => {
    const { gameModelId } = req.params;
    const userId = req.user.userId;
    try {
        const existingLike = await prisma.gameLike.findUnique({
            where: { userId_gameId: { userId, gameId: gameModelId } }
        });

        if (existingLike) {
            await prisma.gameLike.delete({ where: { id: existingLike.id } });
            await prisma.game.update({
                where: { id: gameModelId },
                data: { likeCount: { decrement: 1 } }
            });
            return Response.ok(res, "Oyun beğenisi geri alındı.", { begenildi: false });
        } else {
            await prisma.gameLike.create({ data: { userId, gameId: gameModelId } });
            await prisma.game.update({
                where: { id: gameModelId },
                data: { likeCount: { increment: 1 } }
            });
            return Response.created(res, "Oyun beğenildi.", { begenildi: true });
        }
    } catch (error) {
        console.error(`Oyun beğenme hatası:`, error);
        return Response.internalServerError(res, "İşlem sırasında bir hata oluştu.");
    }
};

exports.rateGame = async (req, res) => {
    const { gameModelId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;
    const numRating = parseInt(rating, 10);

    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return Response.badRequest(res, "Puan 1 ile 5 arasında olmalıdır.");
    }

    try {
        await prisma.gameRating.upsert({
            where: { userId_gameId: { userId, gameId: gameModelId } },
            update: { rating: numRating, comment: comment || null },
            create: { userId, gameId: gameModelId, rating: numRating, comment: comment || null }
        });

        const stats = await prisma.gameRating.aggregate({
            _avg: { rating: true },
            _count: { rating: true },
            where: { gameId: gameModelId },
        });

        await prisma.game.update({
            where: { id: gameModelId },
            data: {
                averageRating: stats._avg.rating || 0,
                ratingCount: stats._count.rating || 0
            }
        });

        return Response.ok(res, "Oyuna puanınız kaydedildi.");
    } catch (error) {
        console.error(`Oyuna puan verme hatası:`, error);
        return Response.internalServerError(res, "Puan verilirken bir hata oluştu.");
    }
};

exports.getGameRatings = async (req, res) => {
    const { gameModelId } = req.params;
    try {
        const ratings = await prisma.gameRating.findMany({
            where: { gameId: gameModelId },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { id: true, username: true, profilePictureUrl: true } } }
        });
        return Response.ok(res, `Oyun puanları listelendi.`, { puanlar: ratings });
    } catch (error) {
        console.error(`Oyun puanlarını listeleme hatası:`, error);
        return Response.internalServerError(res, "Puanlar listelenirken bir hata oluştu.");
    }
};
