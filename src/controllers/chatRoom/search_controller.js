// src/controllers/chatRoom/search.controller.js

const { PrismaClient, ChatRoomStatus, ChatRoomType } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

const listPublicChatRooms = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    try {
        const rooms = await prisma.chatRoom.findMany({
            where: {
                type: ChatRoomType.PUBLIC,
                status: ChatRoomStatus.ACTIVE
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take,
            include: { owner: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } } }
        });
        const totalRooms = await prisma.chatRoom.count({ where: { type: ChatRoomType.PUBLIC, status: ChatRoomStatus.ACTIVE } });

        return Response.ok(res, 'Herkese açık sohbet odaları listelendi.', {
            odalar: rooms,
            meta: {
                toplamOda: totalRooms,
                suankiSayfa: parseInt(page),
                toplamSayfa: Math.ceil(totalRooms / take) || 1
            }
        });
    } catch (error) {
        console.error("Sohbet odalarını listeleme hatası:", error);
        return Response.internalServerError(res, 'Sohbet odaları listelenirken bir hata oluştu.');
    }
};

const searchChatRooms = async (req, res) => {
    const { query, page = 1, limit = 10 } = req.query;
    if (!query) {
        return Response.badRequest(res, "Arama terimi ('query') gereklidir.");
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    try {
        const whereClause = {
            status: ChatRoomStatus.ACTIVE,
            type: ChatRoomType.PUBLIC,
            OR: [
                { title: { contains: query } },
                { description: { contains: query } },
            ],
        };

        const rooms = await prisma.chatRoom.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            skip,
            take,
            include: { owner: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } } }
        });
        const totalRooms = await prisma.chatRoom.count({ where: whereClause });

        return Response.ok(res, `Arama sonuçları '${query}' için listelendi.`, {
            odalar: rooms,
            meta: {
                toplamSonuc: totalRooms,
                suankiSayfa: parseInt(page),
                toplamSayfa: Math.ceil(totalRooms / take) || 1
            }
        });
    } catch (error) {
        console.error("Oda arama hatası:", error);
        return Response.internalServerError(res, "Odalar aranırken bir hata oluştu.");
    }
};

module.exports = {
    listPublicChatRooms,
    searchChatRooms,
};