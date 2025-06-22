// src/controllers/userSettings/profile_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { sanitizeUser } = require('../auth/utils'); // Modüler yapıdan import edildi

/**
 * Kullanıcının profil bilgilerini (takma ad, bio, resim vb.) günceller.
 */
exports.updateProfile = async (req, res) => {
    const userId = req.user.userId;
    const { nickname, profilePictureUrl, bio, gender, birthDate, country, region } = req.body;

    try {
        const updateData = {};
        if (nickname !== undefined) updateData.nickname = nickname;
        if (profilePictureUrl !== undefined) updateData.profilePictureUrl = profilePictureUrl;
        if (bio !== undefined) updateData.bio = bio;
        if (gender !== undefined) updateData.gender = gender;
        if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
        if (country !== undefined) updateData.country = country;
        if (region !== undefined) updateData.region = region;

        if (Object.keys(updateData).length === 0) {
            return Response.badRequest(res, 'Güncellenecek en az bir alan sağlamalısınız.');
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        return Response.ok(res, 'Profil başarıyla güncellendi.', { kullanici: sanitizeUser(updatedUser) });
    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        return Response.internalServerError(res, 'Profil güncellenirken bir hata oluştu.');
    }
};
