// src/controllers/userPreferences/notification_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

const defaultPreferences = {
    likes: { push: true, email: false },
    comments: { push: true, email: false },
    newFollowers: { push: true, email: true },
    directMessages: { push: true, email: true },
    //... diğer varsayılanlar
};

/**
 * Kullanıcının tüm bildirim tercihlerini getirir.
 */
exports.getNotificationPreferences = async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { notificationPreferences: true }
        });
        if (!user) {
            return Response.notFound(res, 'Kullanıcı bulunamadı.');
        }
        
        // Eksik ayarlar için varsayılanları birleştir
        const preferences = { ...defaultPreferences, ...(user.notificationPreferences || {}) };
        
        return Response.ok(res, 'Bildirim tercihleri getirildi.', preferences);
    } catch (error) {
        console.error('Bildirim tercihleri getirme hatası:', error);
        return Response.internalServerError(res, 'Tercihler getirilirken bir hata oluştu.');
    }
};

/**
 * Kullanıcının bildirim tercihlerini günceller.
 */
exports.updateNotificationPreferences = async (req, res) => {
    const userId = req.user.userId;
    const newPreferencesPart = req.body;

    if (typeof newPreferencesPart !== 'object' || !newPreferencesPart) {
        return Response.badRequest(res, 'Geçersiz tercih formatı.');
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { notificationPreferences: true }
        });
        if (!user) {
            return Response.notFound(res, 'Kullanıcı bulunamadı.');
        }

        const currentPreferences = user.notificationPreferences || {};
        const updatedPreferences = { ...currentPreferences, ...newPreferencesPart };

        await prisma.user.update({
            where: { id: userId },
            data: { notificationPreferences: updatedPreferences }
        });
        return Response.ok(res, 'Bildirim tercihleri güncellendi.', updatedPreferences);
    } catch (error) {
        console.error('Bildirim tercihleri güncelleme hatası:', error);
        return Response.internalServerError(res, 'Tercihler güncellenirken bir hata oluştu.');
    }
};
