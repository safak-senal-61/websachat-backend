// src/controllers/twoFactor/verification_controller.js
const speakeasy = require('speakeasy');
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { generateTokens, sanitizeUser } = require('../auth/utils'); // Modüler yapıdan import edildi

/**
 * Login akışı sırasında 2FA kodunu doğrular ve oturum başlatır.
 */
exports.verifyLoginTwoFactor = async (req, res) => {
    const { userId, token } = req.body;

    if (!userId || !token) {
        return Response.badRequest(res, 'Kullanıcı ID ve 2FA kodu gereklidir.');
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
            return Response.badRequest(res, 'Kullanıcı için 2FA aktif değil veya secret bulunamadı.');
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token,
            window: 1,
        });

        if (verified) {
            const loginTokens = await generateTokens(user, res);
            return Response.ok(res, '2FA doğrulandı, giriş başarılı.', {
                tokenlar: loginTokens,
                kullanici: sanitizeUser(user)
            });
        } else {
            return Response.badRequest(res, 'Geçersiz 2FA kodu.');
        }
    } catch (error) {
        console.error('Login 2FA doğrulama hatası:', error);
        return Response.internalServerError(res, '2FA kodu doğrulanırken bir hata oluştu.');
    }
};

/**
 * Login akışı sırasında yedek kodu doğrular ve oturum başlatır.
 */
exports.verifyWithBackupCode = async (req, res) => {
    const { userId, backupCode } = req.body;

    if (!userId || !backupCode) {
        return Response.badRequest(res, 'Kullanıcı ID ve yedek kod gereklidir.');
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorEnabled || !user.twoFactorRecoveryCodes?.codes) {
            return Response.badRequest(res, 'Kullanıcı için 2FA veya yedek kodları aktif değil.');
        }

        const codes = user.twoFactorRecoveryCodes.codes;
        const usedCodes = user.twoFactorRecoveryCodes.used || [];

        if (codes.includes(backupCode) && !usedCodes.includes(backupCode)) {
            const newUsedCodes = [...usedCodes, backupCode];
            
            await prisma.user.update({
                where: { id: userId },
                data: {
                    twoFactorRecoveryCodes: { codes: codes, used: newUsedCodes }
                }
            });

            const loginTokens = await generateTokens(user, res);
            return Response.ok(res, 'Yedek kod doğrulandı, giriş başarılı.', {
                tokenlar: loginTokens,
                kullanici: sanitizeUser(user)
            });
        } else {
            return Response.badRequest(res, 'Geçersiz veya daha önce kullanılmış yedek kod.');
        }
    } catch (error) {
        console.error('Yedek kod doğrulama hatası:', error);
        return Response.internalServerError(res, 'Yedek kod doğrulanırken bir hata oluştu.');
    }
};
