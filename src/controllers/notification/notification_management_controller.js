// src/controllers/notification/notification_management_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

/**
 * Kullanıcının bildirimlerini listeler (sayfalanmış, okunmuş/okunmamış filtreli).
 */
exports.getMyNotifications = async (req, res) => {
    const recipientId = req.user.userId;
    const { page = 1, limit = 20, isRead, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereConditions = { recipientId };
    if (isRead !== undefined) {
        whereConditions.isRead = isRead === 'true';
    }
    if (type) {
        whereConditions.type = type;
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: whereConditions,
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit),
            include: { sender: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } } }
        });
        const totalNotifications = await prisma.notification.count({ where: whereConditions });

        return Response.ok(res, "Bildirimleriniz başarıyla listelendi.", {
            bildirimler: notifications,
            meta: {
                toplamBildirim: totalNotifications,
                suankiSayfa: parseInt(page),
                toplamSayfa: Math.ceil(totalNotifications / parseInt(limit))
            }
        });
    } catch (error) {
        console.error("Bildirimleri listeleme hatası:", error);
        return Response.internalServerError(res, "Bildirimler listelenirken bir hata oluştu.");
    }
};

/**
 * Belirli bir bildirimi okundu olarak işaretler.
 */
exports.markNotificationAsRead = async (req, res) => {
    const { notificationId } = req.params;
    const recipientId = req.user.userId;

    try {
        const notification = await prisma.notification.findFirst({
            where: { id: notificationId, recipientId: recipientId }
        });
        if (!notification) {
            return Response.notFound(res, "Bildirim bulunamadı veya size ait değil.");
        }

        const updatedNotification = await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });
        return Response.ok(res, "Bildirim başarıyla okundu olarak işaretlendi.", { bildirim: updatedNotification });
    } catch (error) {
        console.error("Bildirim okundu işaretleme hatası:", error);
        return Response.internalServerError(res, "Bildirim okundu olarak işaretlenirken bir hata oluştu.");
    }
};

/**
 * Kullanıcının tüm okunmamış bildirimlerini okundu olarak işaretler.
 */
exports.markAllNotificationsAsRead = async (req, res) => {
    const recipientId = req.user.userId;
    try {
        const { count } = await prisma.notification.updateMany({
            where: { recipientId: recipientId, isRead: false },
            data: { isRead: true },
        });
        return Response.ok(res, `${count} adet bildirim okundu olarak işaretlendi.`);
    } catch (error) {
        console.error("Tüm bildirimleri okundu işaretleme hatası:", error);
        return Response.internalServerError(res, "Bildirimler okundu olarak işaretlenirken bir hata oluştu.");
    }
};
