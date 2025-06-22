// src/controllers/notification/notification_sending_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { sendPushNotification } = require('../../utils/oneSignal_sender');

const NOTIFICATION_TYPES = { SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT' }; // Gerekli tipleri buraya ekleyin

/**
 * Yeni bir bildirim oluşturur ve push bildirimi gönderir (Backend içi kullanım için).
 * Bu fonksiyon doğrudan bir API endpoint'i tarafından çağrılmaz, diğer servisler tarafından kullanılır.
 */
const createAndSendNotification = async (data) => {
    const { recipientId, senderId, type, content, pushHeading, pushContent, pushData, pushUrl } = data;

    if (!recipientId || !type || !content || !pushHeading || !pushContent) {
        console.error("Bildirim oluşturma hatası: Gerekli alanlar eksik.", data);
        return null;
    }

    try {
        const newNotification = await prisma.notification.create({
            data: { recipientId, senderId, type, content },
            include: { recipient: { select: { oneSignalPlayerIds: true, username: true } } }
        });

        if (newNotification.recipient.oneSignalPlayerIds?.length > 0) {
            const notificationPayload = {
                include_player_ids: newNotification.recipient.oneSignalPlayerIds,
                headings: { "en": pushHeading, "tr": pushHeading },
                contents: { "en": pushContent, "tr": pushContent },
                data: { notificationId: newNotification.id, ...pushData },
                url: pushUrl
            };
            await sendPushNotification(notificationPayload);
        }
        return newNotification;
    } catch (error) {
        console.error("createAndSendNotification hatası:", error);
        return null;
    }
};

/**
 * Admin için sistem duyurusu gönderir.
 */
exports.sendSystemAnnouncement = async (req, res) => {
    const { title, message, targetUserIds, targetSegment } = req.body;

    if (!title || !message) {
        return Response.badRequest(res, "Duyuru için başlık ve mesaj zorunludur.");
    }
    if (!targetUserIds && !targetSegment) {
        return Response.badRequest(res, "Hedef kullanıcı(lar) veya segment belirtilmelidir.");
    }

    try {
        if (targetUserIds?.length > 0) {
            const users = await prisma.user.findMany({
                where: { id: { in: targetUserIds } },
                select: { id: true }
            });
            for (const user of users) {
                await createAndSendNotification({
                    recipientId: user.id,
                    type: NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
                    content: message,
                    pushHeading: title,
                    pushContent: message.substring(0, 100),
                });
            }
        } else if (targetSegment) {
            // OneSignal segmentlerine toplu push bildirimi gönder
            const notificationPayload = {
                included_segments: [targetSegment],
                headings: { "en": title, "tr": title },
                contents: { "en": message, "tr": message },
                data: { type: NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT }
            };
            await sendPushNotification(notificationPayload);
            // Not: Bu durumda her kullanıcıya ayrı DB kaydı atmak performans sorunları yaratabilir.
            // Bu nedenle genellikle sadece push bildirimi gönderilir.
        }
        return Response.ok(res, "Sistem duyurusu başarıyla gönderilmeye başlandı.");
    } catch (error) {
        console.error("Sistem duyurusu gönderme hatası:", error);
        return Response.internalServerError(res, "Duyuru gönderilirken bir hata oluştu.");
    }
};

// Diğer controller'ların kullanabilmesi için bu fonksiyonu da export edebiliriz.
exports.createAndSendNotification = createAndSendNotification;
