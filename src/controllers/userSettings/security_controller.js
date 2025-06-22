// src/controllers/userSettings/security_controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { sendEmail } = require('../../utils/mailer');
const { sanitizeUser } = require('../auth/utils');

const EMAIL_CHANGE_SECRET = process.env.EMAIL_CHANGE_VERIFICATION_SECRET || 'your-email-change-secret';
const EMAIL_CHANGE_EXPIRES_IN = process.env.EMAIL_CHANGE_VERIFICATION_EXPIRES_IN || '1h';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3001';

/**
 * Kullanıcının mevcut şifresini doğrular ve yeni bir şifre belirler.
 */
exports.updatePassword = async (req, res) => {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
        return Response.badRequest(res, 'Mevcut şifre ve en az 8 karakterli yeni şifre gereklidir.');
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return Response.unauthorized(res, 'Mevcut şifreniz yanlış.');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedNewPassword,
                passwordChangedAt: new Date() // <-- YENİ EKLENEN ALAN: Şifre değiştirme zamanını güncelle
            },
        });

        await prisma.refreshToken.deleteMany({ where: { userId: userId } });

        return Response.ok(res, 'Şifreniz güncellendi. Diğer tüm oturumlarınız sonlandırıldı.');
    } catch (error) {
        console.error('Şifre güncelleme hatası:', error);
        return Response.internalServerError(res, 'Şifre güncellenirken bir hata oluştu.');
    }
};

/**
 * Yeni bir e-posta adresi için doğrulama talebi başlatır.
 */
exports.requestEmailChange = async (req, res) => {
    const userId = req.user.userId;
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
        return Response.badRequest(res, 'Yeni e-posta adresi ve mevcut şifreniz gereklidir.');
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!(await bcrypt.compare(password, user.password))) {
            return Response.unauthorized(res, 'Mevcut şifreniz yanlış.');
        }

        const tokenPayload = { userId, newEmail, type: 'email_change_verification' };
        const verificationToken = jwt.sign(tokenPayload, EMAIL_CHANGE_SECRET, { expiresIn: EMAIL_CHANGE_EXPIRES_IN });
        const verificationLink = `${CLIENT_URL}/verify-email-change?token=${verificationToken}`;
        await sendEmail(newEmail, 'E-posta Adresi Değişikliği Doğrulaması', `<p>Bu değişikliği onaylamak için linke tıklayın: <a href="${verificationLink}">Doğrula</a></p>`);

        return Response.ok(res, `Doğrulama linki yeni e-posta adresinize (${newEmail}) gönderildi.`);
    } catch (error) {
        console.error('E-posta değiştirme talebi hatası:', error);
        return Response.internalServerError(res, 'Talep işlenirken bir hata oluştu.');
    }
};

/**
 * E-posta ile gönderilen token'ı doğrulayarak e-posta adresini günceller.
 */
exports.verifyNewEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) return Response.badRequest(res, 'Doğrulama token\'ı sağlanmadı.');

    try {
        const decoded = jwt.verify(token, EMAIL_CHANGE_SECRET);
        if (decoded.type !== 'email_change_verification') {
            return Response.badRequest(res, 'Geçersiz token tipi.');
        }

        const { userId, newEmail } = decoded;
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { email: newEmail, isEmailVerified: true },
        });

        return Response.ok(res, 'E-posta adresiniz başarıyla güncellendi.', { kullanici: sanitizeUser(updatedUser) });
    } catch (error) {
        console.error('Yeni e-posta doğrulama hatası:', error);
        return Response.internalServerError(res, 'Yeni e-posta doğrulanırken bir hata oluştu.');
    }
};