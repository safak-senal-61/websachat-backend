// src/controllers/userSettings/username_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { sanitizeUser } = require('../auth/utils');
const bcrypt = require('bcryptjs');

/**
 * Kullanıcının kullanıcı adını değiştirir.
 * Kullanıcı adı değişikliği için şifre doğrulaması gereklidir.
 */
exports.changeUsername = async (req, res) => {
    const userId = req.user.userId;
    const { newUsername, password } = req.body;

    if (!newUsername || !password) {
        return Response.badRequest(res, 'Yeni kullanıcı adı ve şifreniz gereklidir.');
    }

    // Kullanıcı adı formatını kontrol et
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(newUsername)) {
        return Response.badRequest(res, 'Kullanıcı adı 3-20 karakter arasında olmalı ve sadece harf, rakam ve alt çizgi içermelidir.');
    }

    try {
        // Kullanıcıyı bul ve şifreyi doğrula
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return Response.notFound(res, 'Kullanıcı bulunamadı.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return Response.unauthorized(res, 'Şifreniz yanlış.');
        }

        // Yeni kullanıcı adının kullanılabilir olup olmadığını kontrol et
        const existingUser = await prisma.user.findUnique({ where: { username: newUsername } });
        if (existingUser) {
            return Response.conflict(res, 'Bu kullanıcı adı zaten kullanılıyor.');
        }

        // Kullanıcı adını güncelle
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { username: newUsername },
        });

        return Response.ok(res, 'Kullanıcı adınız başarıyla güncellendi.', { kullanici: sanitizeUser(updatedUser) });
    } catch (error) {
        console.error('Kullanıcı adı değiştirme hatası:', error);
        return Response.internalServerError(res, 'Kullanıcı adı değiştirilirken bir hata oluştu.');
    }
};
