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
        if (!await canUserAccessConversation(senderId, conversationId)) {
            return Response.forbidden(res, "Bu sohbete mesaj gönderme yetkiniz yok.");
        }

        const newMessage = await prisma.message.create({
            data: {
                conversationId,
                senderId,
                receiverId: receiverId || null,
                roomId: conversationId.startsWith('c') ? conversationId : null,
                messageType,
                content: content || null,
                giftId: messageType === 'GIFT' ? giftId : null,
                repliedToMessageId: repliedToMessageId || null,
                readStatus: { [senderId]: new Date().toISOString() }
            },
            include: {
                sender: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
                gift: true,
                repliedToMessage: {
                    include: { sender: { select: { id: true, username: true, nickname: true } } }
                }
            }
        });

        // WebSocket ile yeni mesajı ilgili odaya (sohbete) yayınla
        const io = req.app.get('io');
        io.to(conversationId).emit('new_message', newMessage);

        // Kullanıcı yazmayı bıraktığı için "yazıyor..." göstergesini durdur
        io.to(conversationId).emit('user_typing_stop', {
            userId: senderId,
            username: req.user.username,
            conversationId: conversationId,
        });

        return Response.created(res, "Mesaj başarıyla gönderildi.", { mesaj: newMessage });
    } catch (error) {
        console.error(`Mesaj gönderme hatası:`, error);
        return Response.internalServerError(res, "Mesaj gönderilirken bir hata oluştu.");
    }
};

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

        if (message.senderId !== userId) {
            return Response.forbidden(res, "Bu mesajı güncelleme yetkiniz yok.");
        }

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

        // WebSocket ile mesaj güncellemesini yayınla
        const io = req.app.get('io');
        io.to(updatedMessage.conversationId).emit('update_message', updatedMessage);

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

        const canDeleteGlobally = userId === message.senderId || req.user.role === UserRole.ADMIN;

        if (String(forMeOnly).toLowerCase() === 'true') {
            let deletedFor = Array.isArray(message.isDeletedFor) ? message.isDeletedFor : [];
            if (!deletedFor.includes(userId)) {
                deletedFor.push(userId);
                await prisma.message.update({
                    where: { id: messageId },
                    data: { isDeletedFor: deletedFor },
                });
            }
            return Response.ok(res, "Mesaj sizin için başarıyla silindi.");
        } else {
            if (!canDeleteGlobally) {
                return Response.forbidden(res, "Bu mesajı herkesten silme yetkiniz yok.");
            }
            await prisma.message.delete({ where: { id: messageId } });

            // WebSocket ile mesaj silme olayını yayınla
            const io = req.app.get('io');
            io.to(message.conversationId).emit('delete_message', {
                messageId: messageId,
                conversationId: message.conversationId
            });

            return Response.ok(res, "Mesaj herkesten başarıyla silindi.");
        }
    } catch (error) {
        console.error(`Mesaj silme hatası:`, error);
        return Response.internalServerError(res, "Mesaj silinirken bir hata oluştu.");
    }
};