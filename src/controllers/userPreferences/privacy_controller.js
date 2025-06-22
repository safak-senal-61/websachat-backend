// src/controllers/userPreferences/privacy_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

// --- SETTERS ---

exports.setAccountVisibility = async (req, res) => {
    const userId = req.user.userId;
    const { isPrivate } = req.body;
    if (typeof isPrivate !== 'boolean') {
        return Response.badRequest(res, '`isPrivate` alanı true veya false olmalıdır.');
    }
    try {
        await prisma.user.update({ where: { id: userId }, data: { isPrivate } });
        return Response.ok(res, `Hesap gizlilik durumu güncellendi.`, { isPrivate });
    } catch (error) {
        console.error('Hesap gizlilik ayarı güncelleme hatası:', error);
        return Response.internalServerError(res, 'Ayar güncellenirken bir hata oluştu.');
    }
};

exports.setActivityStatusVisibility = async (req, res) => {
    const userId = req.user.userId;
    const { visibility } = req.body;
    const validValues = ["EVERYONE", "FOLLOWERS", "NOBODY"];
    if (!validValues.includes(visibility)) {
        return Response.badRequest(res, 'Geçersiz görünürlük değeri.');
    }
    try {
        await prisma.user.update({ where: { id: userId }, data: { activityStatusVisibility: visibility } });
        return Response.ok(res, 'Aktivite durumu görünürlük ayarı güncellendi.', { activityStatusVisibility: visibility });
    } catch (error) {
        console.error('Aktivite durumu görünürlük ayarı güncelleme hatası:', error);
        return Response.internalServerError(res, 'Ayar güncellenirken bir hata oluştu.');
    }
};

exports.setSensitiveContentFilter = async (req, res) => {
    const userId = req.user.userId;
    const { enable } = req.body;
    if (typeof enable !== 'boolean') {
        return Response.badRequest(res, '`enable` alanı true veya false olmalıdır.');
    }
    try {
        await prisma.user.update({ where: { id: userId }, data: { enableSensitiveContentFilter: enable } });
        return Response.ok(res, 'Hassas içerik filtresi ayarı güncellendi.', { enableSensitiveContentFilter: enable });
    } catch (error) {
        console.error('Hassas içerik filtresi ayarı güncelleme hatası:', error);
        return Response.internalServerError(res, 'Ayar güncellenirken bir hata oluştu.');
    }
};

// --- GETTERS (EKSİK OLAN KISIM) ---

exports.getAccountVisibility = async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isPrivate: true },
        });
        if (!user) {
            return Response.notFound(res, 'Kullanıcı bulunamadı.');
        }
        return Response.ok(res, 'Hesap gizlilik durumu getirildi.', { isPrivate: user.isPrivate });
    } catch (error) {
        console.error('Hesap gizlilik durumu getirme hatası:', error);
        return Response.internalServerError(res, 'Hesap gizlilik durumu getirilirken bir hata oluştu.');
    }
};

exports.getActivityStatusVisibility = async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { activityStatusVisibility: true },
        });
        if (!user) {
            return Response.notFound(res, 'Kullanıcı bulunamadı.');
        }
        return Response.ok(res, 'Aktivite durumu görünürlük ayarı getirildi.', {
            activityStatusVisibility: user.activityStatusVisibility || "EVERYONE"
        });
    } catch (error) {
        console.error('Aktivite durumu görünürlük ayarı getirme hatası:', error);
        return Response.internalServerError(res, 'Aktivite durumu görünürlük ayarı getirilirken bir hata oluştu.');
    }
};
