// src/controllers/message/message_actions_controller.js
const { PrismaClient, UserRole } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { canUserAccessConversation, canUserManageRoomMessage } = require('./utils_controller');

exports.getMessagesByConversation = async (req, res) => {
    const { conversationId } = req.params;
    const { page = 1, limit = 30 } = req.query;
    const userId = req.user.userId;

    try {
        if (!await canUserAccessConversation(userId, conversationId)) {
            return Response.forbidden(res, "Bu sohbetteki mesajları görme yetkiniz yok.");
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit),
            include: {
                sender: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
                gift: true,
                repliedToMessage: {
                    include: { sender: { select: { id: true, username: true, nickname: true } } }
                }
            }
        });

        return Response.ok(res, "Sohbet mesajları başarıyla getirildi.", { mesajlar: messages.reverse() });
    } catch (error) {
        console.error(`Sohbet mesajları getirme hatası:`, error);
        return Response.internalServerError(res, "Mesajlar getirilirken bir hata oluştu.");
    }
};

exports.createMessage = async (req, res) => {
    const { conversationId } = req.params;
    const { content, messageType = "TEXT", receiverId, giftId, repliedToMessageId } = req.body;
    const senderId = req.user.userId;

    if (!content && messageType !== 'GIFT') {
        return Response.badRequest(res, "Mesaj içeriği boş olamaz.");
    }

    try {
        // Yetkilendirme ve doğrulama mantığı...
        // ...

        const newMessage = await prisma.message.create({
            data: {
                conversationId,
                senderId,
                receiverId: receiverId || null,
                roomId: receiverId ? null : conversationId,
                messageType,
                content: content || null,
                giftId: messageType === 'GIFT' ? giftId : null,
                repliedToMessageId: repliedToMessageId || null,
                readStatus: { [senderId]: new Date().toISOString() }
            },
            include: {
                sender: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
            }
        });

        // TODO: WebSocket ile yeni mesajı yayınla
        return Response.created(res, "Mesaj başarıyla gönderildi.", { mesaj: newMessage });
    } catch (error) {
        console.error(`Mesaj gönderme hatası:`, error);
        return Response.internalServerError(res, "Mesaj gönderilirken bir hata oluştu.");
    }
};

// EKSİK OLAN FONKSİYON EKLENDİ
exports.updateMessage = async (req, res) => {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content) {
        return Response.badRequest(res, "Güncellenecek mesaj içeriği boş olamaz.");
    }

    try {
        const message = await prisma.message.findUnique({ where: { id: messageId } });
        if (!message) {
            return Response.notFound(res, "Güncellenecek mesaj bulunamadı.");
        }

        // Sadece mesajı gönderen kişi mesajını güncelleyebilir.
        if (message.senderId !== userId) {
            return Response.forbidden(res, "Bu mesajı güncelleme yetkiniz yok.");
        }

        // Opsiyonel: Mesajın gönderilmesinden sonra belirli bir süre içinde güncellenmesine izin verilebilir.
        // const timeDiff = new Date() - message.createdAt;
        // if (timeDiff > 5 * 60 * 1000) { // 5 dakika
        //     return Response.forbidden(res, "Mesajı göndermenizin üzerinden çok zaman geçtiği için güncelleyemezsiniz.");
        // }

        const updatedMessage = await prisma.message.update({
            where: { id: messageId },
            data: { 
                content: content,
                isEdited: true 
            },
            include: {
                sender: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } }
            }
        });
        
        // TODO: WebSocket ile mesaj güncellemesini yayınla
        return Response.ok(res, "Mesaj başarıyla güncellendi.", { mesaj: updatedMessage });

    } catch (error) {
        console.error(`Mesaj güncelleme hatası:`, error);
        return Response.internalServerError(res, "Mesaj güncellenirken bir hata oluştu.");
    }
};


exports.deleteMessage = async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.userId;
    const { forMeOnly = false } = req.query;

    try {
        const message = await prisma.message.findUnique({ where: { id: messageId } });
        if (!message) return Response.notFound(res, "Silinecek mesaj bulunamadı.");

        if (String(forMeOnly).toLowerCase() === 'true') {
            // Sadece kullanıcı için silme mantığı...
            return Response.ok(res, "Mesaj sizin için başarıyla silindi.");
        } else {
            // Herkesten silme yetki kontrolü ve işlemi...
            const canDeleteGlobally = userId === message.senderId || req.user.role === UserRole.ADMIN; // Simplified
            if (!canDeleteGlobally) {
                return Response.forbidden(res, "Bu mesajı herkesten silme yetkiniz yok.");
            }
            await prisma.message.delete({ where: { id: messageId } });
            return Response.ok(res, "Mesaj herkesten başarıyla silindi.");
        }
    } catch (error) {
        console.error(`Mesaj silme hatası:`, error);
        return Response.internalServerError(res, "Mesaj silinirken bir hata oluştu.");
    }
};
