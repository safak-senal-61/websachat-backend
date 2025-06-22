// src/controllers/userPreferences/interaction_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

// --- SETTERS ---

exports.setDirectMessagePolicy = async (req, res) => {
    const userId = req.user.userId;
    const { policy } = req.body;
    const validValues = ["EVERYONE", "FOLLOWERS_I_FOLLOW", "NOBODY"];
    if (!validValues.includes(policy)) {
        return Response.badRequest(res, 'Geçersiz mesaj politikası değeri.');
    }
    try {
        await prisma.user.update({ where: { id: userId }, data: { allowDirectMessagesFrom: policy } });
        return Response.ok(res, 'Direkt mesaj politikası güncellendi.', { allowDirectMessagesFrom: policy });
    } catch (error) {
        console.error('Direkt mesaj politikası güncelleme hatası:', error);
        return Response.internalServerError(res, 'Ayar güncellenirken bir hata oluştu.');
    }
};

exports.setMentionPolicy = async (req, res) => {
    const userId = req.user.userId;
    const { policy } = req.body;
    const validValues = ["EVERYONE", "FOLLOWERS", "NOBODY"];
    if (!validValues.includes(policy)) {
        return Response.badRequest(res, 'Geçersiz etiketlenme politikası değeri.');
    }
    try {
        await prisma.user.update({ where: { id: userId }, data: { allowMentionsFrom: policy } });
        return Response.ok(res, 'Etiketlenme politikası güncellendi.', { allowMentionsFrom: policy });
    } catch (error) {
        console.error('Etiketlenme politikası güncelleme hatası:', error);
        return Response.internalServerError(res, 'Ayar güncellenirken bir hata oluştu.');
    }
};

exports.setGameInvitePolicy = async (req, res) => {
    const userId = req.user.userId;
    const { policy } = req.body;
    const validValues = ["EVERYONE", "FRIENDS", "NOBODY"];
    if (!validValues.includes(policy)) {
        return Response.badRequest(res, 'Geçersiz oyun daveti politikası değeri.');
    }
    try {
        await prisma.user.update({ where: { id: userId }, data: { allowGameInvitesFrom: policy } });
        return Response.ok(res, 'Oyun daveti politikası güncellendi.', { allowGameInvitesFrom: policy });
    } catch (error) {
        console.error('Oyun daveti politikası güncelleme hatası:', error);
        return Response.internalServerError(res, 'Ayar güncellenirken bir hata oluştu.');
    }
};


// --- GETTERS (EKSİK OLAN KISIM) ---

exports.getDirectMessagePolicy = async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { allowDirectMessagesFrom: true },
        });
        if (!user) {
            return Response.notFound(res, 'Kullanıcı bulunamadı.');
        }
        return Response.ok(res, 'Direkt mesaj politikası getirildi.', {
            allowDirectMessagesFrom: user.allowDirectMessagesFrom || "EVERYONE"
        });
    } catch (error) {
        console.error('Direkt mesaj politikası getirme hatası:', error);
        return Response.internalServerError(res, 'Direkt mesaj politikası getirilirken bir hata oluştu.');
    }
};

exports.getMentionPolicy = async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { allowMentionsFrom: true },
        });
        if (!user) {
            return Response.notFound(res, 'Kullanıcı bulunamadı.');
        }
        return Response.ok(res, 'Etiketlenme politikası getirildi.', {
            allowMentionsFrom: user.allowMentionsFrom || "EVERYONE"
        });
    } catch (error) {
        console.error('Etiketlenme politikası getirme hatası:', error);
        return Response.internalServerError(res, 'Etiketlenme politikası getirilirken bir hata oluştu.');
    }
};
