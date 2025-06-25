// src/controllers/chatRoom/message.controller.js

const { PrismaClient, ChatRoomStatus } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { parseJsonArrayField, isUserRoomModerator } = require('./utils.js');

// ... getRoomMessages fonksiyonu aynı kalır ...

const getRoomMessages = async (req, res) => {
    const { roomId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    try {
        const messages = await prisma.message.findMany({
            where: { roomId },
            orderBy: { createdAt: 'desc' },
            skip,
            take,
            include: { sender: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } } }
        });
        const totalMessages = await prisma.message.count({ where: { roomId } });

        return Response.ok(res, "Oda mesajları başarıyla getirildi.", {
            mesajlar: messages.reverse(),
            meta: {
                toplamMesaj: totalMessages,
                suankiSayfa: parseInt(page),
                toplamSayfa: Math.ceil(totalMessages / take) || 1
            }
        });
    } catch (error) {
        console.error(`Oda mesajları getirme hatası (Oda ID: ${roomId}):`, error);
        return Response.internalServerError(res, "Oda mesajları getirilirken bir hata oluştu.");
    }
};


const postMessageToRoom = async (req, res) => {
    const { roomId } = req.params;
    const { content, messageType = "TEXT" } = req.body;
    const senderId = req.user.userId;

    if (!content || content.trim() === "") {
        return Response.badRequest(res, "Mesaj içeriği boş olamaz.");
    }

    try {
        const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
        if (!room || room.status !== ChatRoomStatus.ACTIVE) {
            return Response.notFound(res, "Mesaj gönderilecek oda bulunamadı veya aktif değil.");
        }

        const participants = parseJsonArrayField(room.activeParticipants);
        const isAllowed = room.ownerId === senderId ||
            (await isUserRoomModerator(senderId, roomId)) ||
            participants.includes(senderId);

        if (!isAllowed) {
            return Response.forbidden(res, "Bu odaya mesaj gönderme yetkiniz yok.");
        }

        const newMessage = await prisma.message.create({
            data: { roomId, senderId, content, messageType },
            include: { sender: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } } }
        });

        // --- YENİ EKLENDİ: WebSocket ile yeni oda mesajını yayınla ---
        const io = req.app.get('io');
        // 'roomId' aynı zamanda Socket.IO odasının adıdır.
        io.to(roomId).emit('new_room_message', newMessage);
        // --- YENİ KISIM SONU ---

        return Response.created(res, "Mesaj başarıyla gönderildi.", { mesaj: newMessage });
    } catch (error) {
        console.error(`Odaya mesaj gönderme hatası (Oda ID: ${roomId}):`, error);
        return Response.internalServerError(res, "Mesaj gönderilirken bir hata oluştu.");
    }
};

module.exports = {
    getRoomMessages,
    postMessageToRoom,
};