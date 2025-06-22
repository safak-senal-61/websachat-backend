// src/controllers/game/game_management_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

const sanitizeGameResponse = (game) => {
    if (!game) return null;
    const gameData = { ...game };
    if (gameData.entryCost !== null) {
        gameData.entryCost = gameData.entryCost.toString();
    }
    return gameData;
};

exports.createGame = async (req, res) => {
    const { gameId, name, description, iconUrl, entryCost, categoryId } = req.body;
    if (!gameId || !name) {
        return Response.badRequest(res, 'Oyun ID ve Adı zorunludur.');
    }
    try {
        const newGame = await prisma.game.create({
            data: {
                gameId,
                name,
                description,
                iconUrl,
                entryCost: BigInt(entryCost || 0),
                categoryId,
            },
            include: { category: true }
        });
        return Response.created(res, 'Oyun başarıyla oluşturuldu.', { oyun: sanitizeGameResponse(newGame) });
    } catch (error) {
        console.error("Oyun oluşturma hatası:", error);
        return Response.internalServerError(res, 'Oyun oluşturulurken bir hata oluştu.');
    }
};

exports.listGames = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    try {
        const games = await prisma.game.findMany({
            skip,
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            include: { category: true }
        });
        const totalGames = await prisma.game.count();
        const sanitizedGames = games.map(sanitizeGameResponse);
        return Response.ok(res, 'Oyunlar listelendi.', {
            oyunlar: sanitizedGames,
            meta: { toplamOyun: totalGames, suankiSayfa: parseInt(page), toplamSayfa: Math.ceil(totalGames / limit) }
        });
    } catch (error) {
        console.error("Oyunları listeleme hatası:", error);
        return Response.internalServerError(res, 'Oyunlar listelenirken bir hata oluştu.');
    }
};

exports.getGameById = async (req, res) => {
    const { gameModelId } = req.params;
    try {
        const game = await prisma.game.findUnique({
            where: { id: gameModelId },
            include: { category: true }
        });
        if (!game) return Response.notFound(res, 'Oyun bulunamadı.');
        return Response.ok(res, 'Oyun detayları getirildi.', { oyun: sanitizeGameResponse(game) });
    } catch (error) {
        console.error(`Oyun getirme hatası:`, error);
        return Response.internalServerError(res, 'Oyun detayları getirilirken bir hata oluştu.');
    }
};

exports.updateGame = async (req, res) => {
    const { gameModelId } = req.params;
    const dataToUpdate = req.body;
    if (dataToUpdate.entryCost) {
        dataToUpdate.entryCost = BigInt(dataToUpdate.entryCost);
    }
    try {
        const updatedGame = await prisma.game.update({
            where: { id: gameModelId },
            data: dataToUpdate,
            include: { category: true }
        });
        return Response.ok(res, 'Oyun güncellendi.', { oyun: sanitizeGameResponse(updatedGame) });
    } catch (error) {
        console.error(`Oyun güncelleme hatası:`, error);
        return Response.internalServerError(res, 'Oyun güncellenirken bir hata oluştu.');
    }
};

exports.deleteGame = async (req, res) => {
    const { gameModelId } = req.params;
    try {
        await prisma.game.delete({ where: { id: gameModelId } });
        return Response.ok(res, 'Oyun başarıyla silindi.');
    } catch (error) {
        console.error(`Oyun silme hatası:`, error);
        return Response.internalServerError(res, 'Oyun silinirken bir hata oluştu.');
    }
};
