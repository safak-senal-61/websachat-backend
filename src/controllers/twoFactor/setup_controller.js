// src/controllers/twoFactor/setup_controller.js
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const bcrypt = require('bcryptjs');
const { sanitizeUser } = require('../auth/utils'); // Modüler yapıdan import edildi

/**
 * 2FA kurulumunu başlatır, QR kodu ve secret'ı oluşturur.
 */
exports.enableTwoFactor_setup = async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return Response.notFound(res, 'Kullanıcı bulunamadı.');
        if (user.twoFactorEnabled) return Response.badRequest(res, 'İki faktörlü kimlik doğrulama zaten aktif.');

        const secret = speakeasy.generateSecret({
            name: `Websachat (${user.email || user.username})`,
            issuer: 'Websachat',
        });

        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) {
                console.error("QR Kod oluşturma hatası:", err);
                return Response.internalServerError(res, 'QR kodu oluşturulurken bir hata oluştu.');
            }
            return Response.ok(res, '2FA kurulumu için QR kodu oluşturuldu.', {
                qrCodeUrl: data_url,
                secret: secret.base32,
            });
        });
    } catch (error) {
        console.error('2FA aktifleştirme (setup) hatası:', error);
        return Response.internalServerError(res, '2FA aktifleştirilirken bir hata oluştu.');
    }
};

/**
 * Kullanıcının gönderdiği token'ı doğrulayarak 2FA'yı aktifleştirir.
 */
exports.enableTwoFactor_verify = async (req, res) => {
    const userId = req.user.userId;
    const { token, secret } = req.body;

    if (!token || !secret) {
        return Response.badRequest(res, '2FA kodu ve secret gereklidir.');
    }

    try {
        const verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: 1,
        });

        if (verified) {
            const user = await prisma.user.update({
                where: { id: userId },
                data: {
                    twoFactorEnabled: true,
                    twoFactorSecret: secret, // Gerçek uygulamada bu şifrelenmeli
                },
            });
            return Response.ok(res, 'İki faktörlü kimlik doğrulama başarıyla aktifleştirildi.', {
                kullanici: sanitizeUser(user),
            });
        } else {
            return Response.badRequest(res, 'Geçersiz 2FA kodu.');
        }
    } catch (error) {
        console.error('2FA aktifleştirme (verify) hatası:', error);
        return Response.internalServerError(res, '2FA kodu doğrulanırken bir hata oluştu.');
    }
};

/**
 * Kullanıcının şifresini ve/veya 2FA kodunu doğrulayarak 2FA'yı devre dışı bırakır.
 */
exports.disableTwoFactor = async (req, res) => {
    const userId = req.user.userId;
    const { password, twoFactorCode } = req.body;

    if (!password) {
        return Response.badRequest(res, 'Şifrenizi girmeniz gerekmektedir.');
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorEnabled) {
            return Response.badRequest(res, 'Kullanıcı bulunamadı veya 2FA aktif değil.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return Response.unauthorized(res, 'Geçersiz şifre.');
        }
        
        // 2FA kodunu da doğrula
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: twoFactorCode,
            window: 1,
        });
        if (!verified) {
            return Response.badRequest(res, 'Geçersiz 2FA kodu.');
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                twoFactorRecoveryCodes: null,
            },
        });
        return Response.ok(res, 'İki faktörlü kimlik doğrulama devre dışı bırakıldı.', {
            kullanici: sanitizeUser(updatedUser)
        });
    } catch (error) {
        console.error('2FA devre dışı bırakma hatası:', error);
        return Response.internalServerError(res, '2FA devre dışı bırakılırken bir hata oluştu.');
    }
};
