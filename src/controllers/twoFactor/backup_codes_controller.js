// src/controllers/twoFactor/backup_codes_controller.js
const speakeasy = require('speakeasy');
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

/**
 * Kullanıcı için yeni yedek kodlar oluşturur ve bir kereliğine gösterir.
 */
exports.generateBackupCodes = async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorEnabled) {
            return Response.badRequest(res, "Yedek kod oluşturmak için 2FA'nın aktif olması gerekir.");
        }

        const backupCodes = [];
        for (let i = 0; i < 10; i++) {
            backupCodes.push(speakeasy.generateSecret({ length: 8, symbols: false }).base32.slice(0, 8).toUpperCase());
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorRecoveryCodes: { codes: backupCodes, used: [] }
            },
        });

        return Response.ok(res, 'Yedek kodlar oluşturuldu. Lütfen güvenli bir yerde saklayın.', {
            backupCodes: backupCodes,
        });
    } catch (error) {
        console.error('Yedek kodu oluşturma hatası:', error);
        return Response.internalServerError(res, 'Yedek kodları oluşturulurken bir hata oluştu.');
    }
};
