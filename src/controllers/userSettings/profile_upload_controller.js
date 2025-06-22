// src/controllers/userSettings/profile_upload_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { sanitizeUser } = require('../auth/utils');
const fs = require('fs');
const path = require('path');

/**
 * Kullanıcının profil fotoğrafını yükler ve günceller.
 */
exports.uploadProfileImage = async (req, res) => {
    const userId = req.user.userId;

    try {
        if (!req.file) {
            return Response.badRequest(res, 'Profil fotoğrafı yüklenemedi. Lütfen geçerli bir resim dosyası seçin.');
        }

        // Eski profil fotoğrafını bul
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { profilePictureUrl: true }
        });

        // Yeni profil fotoğrafının URL'ini oluştur
        const relativePath = `/images/profiles/${req.file.filename}`;
        const fullUrl = `${req.protocol}://${req.get('host')}${relativePath}`;

        // Kullanıcının profil fotoğrafını güncelle
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { profilePictureUrl: fullUrl },
        });

        // Eski profil fotoğrafını sil (eğer varsa ve sistem tarafından yüklenmiş bir dosya ise)
        if (user.profilePictureUrl && user.profilePictureUrl.includes('/images/profiles/')) {
            try {
                const oldImagePath = user.profilePictureUrl.split('/images/profiles/')[1];
                if (oldImagePath) {
                    const fullPath = path.join(__dirname, '../../../public/images/profiles', oldImagePath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                }
            } catch (error) {
                console.error('Eski profil fotoğrafı silinirken hata:', error);
                // Eski dosya silinemese bile işleme devam et
            }
        }

        return Response.ok(res, 'Profil fotoğrafı başarıyla güncellendi.', { 
            kullanici: sanitizeUser(updatedUser),
            profilePictureUrl: fullUrl 
        });
    } catch (error) {
        console.error('Profil fotoğrafı yükleme hatası:', error);
        return Response.internalServerError(res, 'Profil fotoğrafı yüklenirken bir hata oluştu.');
    }
};