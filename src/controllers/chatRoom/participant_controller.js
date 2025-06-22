// src/controllers/chatRoom/participant.controller.js

const { PrismaClient, ChatRoomStatus, ChatRoomType } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const bcrypt = require('bcryptjs');
const { parseJsonArrayField } = require('./utils.js');

const joinChatRoom = async (req, res) => {
    const { roomId } = req.params;
    const { password } = req.body;
    const userId = req.user.userId;

    try {
        const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
        if (!room || room.status !== ChatRoomStatus.ACTIVE) {
            return Response.notFound(res, 'Sohbet odası bulunamadı veya aktif değil.');
        }

        if (room.type === ChatRoomType.PRIVATE) {
            if (!password) return Response.badRequest(res, 'Bu özel bir odadır, şifre gereklidir.');
            const isPasswordCorrect = await bcrypt.compare(password, room.passwordHash || "");
            if (!isPasswordCorrect) return Response.unauthorized(res, 'Oda şifresi yanlış.');
        }

        let activeParticipants = parseJsonArrayField(room.activeParticipants);
        if (activeParticipants.includes(userId)) {
            return Response.ok(res, 'Zaten bu odadasınız.');
        }
        if (room.currentParticipantCount >= room.maxParticipants) {
            return Response.forbidden(res, 'Oda kapasitesi dolu.');
        }

        await prisma.chatRoom.update({
            where: { id: roomId },
            data: {
                activeParticipants: { push: userId },
                currentParticipantCount: { increment: 1 }
            }
        });
        return Response.ok(res, 'Odaya başarıyla katıldınız.');
    } catch (error) {
        console.error(`Odaya katılma hatası (Oda ID: ${roomId}, Kullanıcı ID: ${userId}):`, error);
        return Response.internalServerError(res, 'Odaya katılırken bir hata oluştu.');
    }
};

const leaveChatRoom = async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.userId;

    try {
        const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
        if (!room) return Response.ok(res, 'Odadan ayrıldınız veya zaten odada değildiniz.');

        let activeParticipants = parseJsonArrayField(room.activeParticipants);
        if (!activeParticipants.includes(userId)) {
            return Response.ok(res, 'Zaten bu odada değilsiniz.');
        }

        const newParticipants = activeParticipants.filter(id => id !== userId);
        await prisma.chatRoom.update({
            where: { id: roomId },
            data: {
                activeParticipants: newParticipants,
                currentParticipantCount: { decrement: 1 }
            }
        });
        return Response.ok(res, 'Odadan başarıyla ayrıldınız.');
    } catch (error) {
        console.error(`Odadan ayrılma hatası (Oda ID: ${roomId}, Kullanıcı ID: ${userId}):`, error);
        return Response.internalServerError(res, 'Odadan ayrılırken bir hata oluştu.');
    }
};

module.exports = {
    joinChatRoom,
    leaveChatRoom,
};
