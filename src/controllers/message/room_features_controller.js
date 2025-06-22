// src/controllers/message/room_features_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { parseJsonArrayField, canUserManageRoomMessage, canUserAccessConversation } = require('./utils_controller');

exports.pinMessageInRoom = async (req, res) => {
    const { roomId, messageId } = req.params;
    const userId = req.user.userId;

    try {
        if (!await canUserManageRoomMessage(userId, req.user.role, roomId, null)) {
            return Response.forbidden(res, "Bu odada mesaj sabitleme yetkiniz yok.");
        }
        const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
        if (!room) return Response.notFound(res, "Oda bulunamadı.");

        let pinnedMessageIds = parseJsonArrayField(room.pinnedMessageIds);
        if (pinnedMessageIds.includes(messageId)) {
            return Response.badRequest(res, "Bu mesaj zaten sabitlenmiş.");
        }
        
        pinnedMessageIds.push(messageId);
        await prisma.chatRoom.update({
            where: { id: roomId },
            data: { pinnedMessageIds }
        });
        
        // TODO: WebSocket ile mesaj sabitleme bildirimi
        return Response.ok(res, "Mesaj başarıyla sabitlendi.");
    } catch (error) {
        console.error("Mesaj sabitleme hatası:", error);
        return Response.internalServerError(res, "Mesaj sabitlenirken bir hata oluştu.");
    }
};

exports.unpinMessageInRoom = async (req, res) => {
    const { roomId, messageId } = req.params;
    const userId = req.user.userId;

    try {
        if (!await canUserManageRoomMessage(userId, req.user.role, roomId, null)) {
            return Response.forbidden(res, "Bu odada mesaj sabitlemesini kaldırma yetkiniz yok.");
        }
        const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
        if (!room) return Response.notFound(res, "Oda bulunamadı.");
        
        let pinnedMessageIds = parseJsonArrayField(room.pinnedMessageIds);
        if (!pinnedMessageIds.includes(messageId)) {
            return Response.badRequest(res, "Bu mesaj zaten sabitlenmemiş.");
        }

        const newPinnedIds = pinnedMessageIds.filter(id => id !== messageId);
        await prisma.chatRoom.update({
            where: { id: roomId },
            data: { pinnedMessageIds: newPinnedIds }
        });

        // TODO: WebSocket ile bildirim
        return Response.ok(res, "Mesaj sabitlemesi kaldırıldı.");
    } catch (error) {
        console.error("Mesaj sabitleme kaldırma hatası:", error);
        return Response.internalServerError(res, "Mesaj sabitlemesi kaldırılırken bir hata oluştu.");
    }
};

exports.getPinnedMessagesInRoom = async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.userId;

    try {
        if (!await canUserAccessConversation(userId, roomId)) {
            return Response.forbidden(res, "Bu odanın sabitlenmiş mesajlarını görme yetkiniz yok.");
        }
        const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
        if (!room) return Response.notFound(res, "Oda bulunamadı.");

        const pinnedMessageIds = parseJsonArrayField(room.pinnedMessageIds);
        if (pinnedMessageIds.length === 0) {
            return Response.ok(res, "Sabitlenmiş mesaj bulunmuyor.", { mesajlar: [] });
        }

        const pinnedMessages = await prisma.message.findMany({
            where: { id: { in: pinnedMessageIds } },
            include: { sender: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } } }
        });
        
        return Response.ok(res, "Sabitlenmiş mesajlar getirildi.", { mesajlar: pinnedMessages });
    } catch (error) {
        console.error("Sabitlenmiş mesajları getirme hatası:", error);
        return Response.internalServerError(res, "Sabitlenmiş mesajlar getirilirken bir hata oluştu.");
    }
};
