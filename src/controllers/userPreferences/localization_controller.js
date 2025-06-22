// src/controllers/userPreferences/localization_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

/**
 * Kullanıcının uygulama dil tercihini ayarlar.
 */
exports.setLanguagePreference = async (req, res) => {
    const userId = req.user.userId;
    const { languageCode } = req.body;

    if (!languageCode || typeof languageCode !== 'string' || languageCode.length < 2) {
        return Response.badRequest(res, 'Geçersiz dil kodu formatı.');
    }
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { languagePreference: languageCode.toLowerCase() },
        });
        return Response.ok(res, 'Dil tercihi güncellendi.', { languagePreference: languageCode.toLowerCase() });
    } catch (error) {
        console.error('Dil tercihi güncelleme hatası:', error);
        return Response.internalServerError(res, 'Dil tercihi güncellenirken bir hata oluştu.');
    }
};

/**
 * Kullanıcının mevcut dil tercihini getirir.
 */
exports.getLanguagePreference = async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { languagePreference: true },
        });
        if (!user) {
            return Response.notFound(res, 'Kullanıcı bulunamadı.');
        }
        return Response.ok(res, 'Dil tercihi getirildi.', {
            languagePreference: user.languagePreference || "tr" // Varsayılan dil
        });
    } catch (error) {
        console.error('Dil tercihi getirme hatası:', error);
        return Response.internalServerError(res, 'Dil tercihi getirilirken bir hata oluştu.');
    }
};
