// src/controllers/gift/gift_sending_controller.js
const { PrismaClient, TransactionType, TransactionStatus } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

// Currency enum'u Prisma tarafından generate edilmediği için manuel olarak tanımlandı.
const Currency = {
    USD: 'USD',
    DIAMOND: 'DIAMOND',
    COIN: 'COIN'
};

exports.sendGift = async (req, res) => {
    const { giftModelId } = req.params;
    const { targetUserId, roomId } = req.body;
    const senderId = req.user.userId;

    if (!targetUserId && !roomId) {
        return Response.badRequest(res, "Hediye için bir alıcı kullanıcı veya oda belirtilmelidir.");
    }
    if (targetUserId === senderId) {
        return Response.badRequest(res, "Kendinize hediye gönderemezsiniz.");
    }

    try {
        const gift = await prisma.gift.findUnique({ where: { id: giftModelId } });
        if (!gift || !gift.isActive) {
            return Response.notFound(res, "Gönderilecek hediye bulunamadı veya aktif değil.");
        }

        const sender = await prisma.user.findUnique({ where: { id: senderId }, select: { coins: true } });
        if (sender.coins < gift.cost) {
            return Response.paymentRequired(res, `Yeterli jetonunuz yok. Gerekli: ${gift.cost}, Mevcut: ${sender.coins}`);
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Gönderenin jetonlarını azalt
            await tx.user.update({
                where: { id: senderId },
                data: { coins: { decrement: gift.cost } }
            });

            // 2. Gönderen için işlem kaydı oluştur
            await tx.transaction.create({
                data: {
                    userId: senderId,
                    transactionType: TransactionType.GIFT_SEND,
                    amount: gift.cost,
                    currency: Currency.COIN,
                    relatedEntityId: gift.id,
                    relatedEntityType: 'GIFT',
                    status: TransactionStatus.COMPLETED
                }
            });

            // 3. Eğer alıcı varsa, elmaslarını artır ve işlem kaydı oluştur
            if (targetUserId) {
                await tx.user.update({
                    where: { id: targetUserId },
                    data: { diamonds: { increment: gift.value } }
                });
                await tx.transaction.create({
                    data: {
                        userId: targetUserId,
                        transactionType: TransactionType.GIFT_RECEIVE,
                        amount: gift.value,
                        currency: Currency.DIAMOND,
                        relatedEntityId: gift.id,
                        relatedEntityType: 'GIFT_FROM_USER',
                        status: TransactionStatus.COMPLETED
                    }
                });
            }

            // 4. Sohbete/Odaya mesaj bırak
            const newMessage = await tx.message.create({
                data: {
                    conversationId: roomId || [senderId, targetUserId].sort().join('_'),
                    senderId,
                    receiverId: targetUserId || null,
                    roomId: roomId || null,
                    messageType: 'GIFT',
                    content: `bir ${gift.name} gönderdi!`,
                    giftId: gift.id,
                },
                include: { gift: true }
            });
            return newMessage;
        });

        // TODO: WebSocket bildirimi
        return Response.created(res, "Hediye başarıyla gönderildi.", { gonderilenMesaj: result });

    } catch (error) {
        console.error("Hediye gönderme hatası:", error);
        return Response.internalServerError(res, "Hediye gönderilirken bir hata oluştu.");
    }
};