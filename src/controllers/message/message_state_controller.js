// src/controllers/message/message_state_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { parseJsonObjectField, canUserAccessConversation } = require('./utils_controller');

exports.markMessageAsRead = async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.userId;

    try {
        const message = await prisma.message.findUnique({ where: { id: messageId } });
        if (!message) return Response.notFound(res, "Mesaj bulunamadı.");

        if (message.senderId === userId) {
            return Response.badRequest(res, "Kendi mesajınızı okundu olarak işaretleyemezsiniz.");
        }
        if (!(await canUserAccessConversation(userId, message.conversationId))) {
             return Response.forbidden(res, "Bu sohbetteki mesajları okundu olarak işaretleyemezsiniz.");
        }

        let currentReadStatus = parseJsonObjectField(message.readStatus);
        if (currentReadStatus[userId]) {
            return Response.ok(res, "Mesaj zaten okundu olarak işaretlenmiş.");
        }
        
        currentReadStatus[userId] = new Date().toISOString();

        await prisma.message.update({
            where: { id: messageId },
            data: { readStatus: currentReadStatus }
        });
        
        // TODO: WebSocket ile okundu bilgisi gönder
        return Response.ok(res, "Mesaj okundu olarak işaretlendi.");
    } catch (error) {
        console.error(`Mesaj okundu işaretleme hatası:`, error);
        return Response.internalServerError(res, "Mesaj okundu olarak işaretlenirken bir hata oluştu.");
    }
};

exports.reactToMessage = async (req, res) => {
    const { messageId } = req.params;
    const { reactionEmoji } = req.body;
    const userId = req.user.userId;

    if (!reactionEmoji) {
        return Response.badRequest(res, "Reaksiyon emojisi gereklidir.");
    }

    try {
        const message = await prisma.message.findUnique({ where: { id: messageId } });
        if (!message) return Response.notFound(res, "Mesaj bulunamadı.");
        
        if (!(await canUserAccessConversation(userId, message.conversationId))) {
            return Response.forbidden(res, "Bu mesajlara reaksiyon verme yetkiniz yok.");
        }

        let reactions = parseJsonObjectField(message.reactions);
        
        if (reactions[reactionEmoji] && reactions[reactionEmoji].includes(userId)) {
            // Reaksiyonu kaldır
            reactions[reactionEmoji] = reactions[reactionEmoji].filter(id => id !== userId);
            if (reactions[reactionEmoji].length === 0) {
                delete reactions[reactionEmoji];
            }
        } else {
            // Reaksiyonu ekle
            if (!reactions[reactionEmoji]) {
                reactions[reactionEmoji] = [];
            }
            reactions[reactionEmoji].push(userId);
        }

        const updatedMessage = await prisma.message.update({
            where: { id: messageId },
            data: { reactions: reactions },
            select: { reactions: true }
        });

        // TODO: WebSocket ile reaksiyon güncellemesini yayınla
        return Response.ok(res, "Mesaja reaksiyon işlendi.", { reaksiyonlar: updatedMessage.reactions });
    } catch (error) {
        console.error("Mesaja reaksiyon verme hatası:", error);
        return Response.internalServerError(res, "Mesaja reaksiyon verilirken bir hata oluştu.");
    }
};
