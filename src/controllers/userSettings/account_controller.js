// src/controllers/userSettings/account_controller.js
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

/**
 * Kullanıcı hesabını geçici olarak devre dışı bırakır.
 */
exports.deactivateAccount = async (req, res) => {
    const userId = req.user.userId;
    const { password } = req.body;

    if (!password) {
        return Response.badRequest(res, 'Hesabınızı geçici olarak kapatmak için şifreniz gereklidir.');
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!(await bcrypt.compare(password, user.password))) {
            return Response.unauthorized(res, 'Geçersiz şifre.');
        }

        await prisma.user.update({
            where: { id: userId },
            data: { accountStatus: 'DEACTIVATED' },
        });
        await prisma.refreshToken.deleteMany({ where: { userId: userId } });

        return Response.ok(res, 'Hesabınız geçici olarak kapatıldı. Tekrar giriş yaparak aktifleştirebilirsiniz.');
    } catch (error) {
        console.error('Hesap geçici kapatma hatası:', error);
        return Response.internalServerError(res, 'Hesap kapatılırken bir hata oluştu.');
    }
};

/**
 * Kullanıcı hesabını ve ilgili verileri kalıcı olarak siler.
 */
exports.deleteAccount = async (req, res) => {
    const userId = req.user.userId;
    const { password, confirmation } = req.body;

    if (!password || confirmation.toUpperCase() !== 'HESABIMI KALICI OLARAK SİL') {
        return Response.badRequest(res, 'Şifre ve doğru onay metni gereklidir.');
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!(await bcrypt.compare(password, user.password))) {
            return Response.unauthorized(res, 'Geçersiz şifre.');
        }

        // GDPR ve diğer veri yönetimi politikaları için bu kısım çok önemlidir.
        // İlgili tüm verilerin silinmesi veya anonimleştirilmesi gerekir.
        // Bu örnekte sadece ana kullanıcı kaydını siliyoruz.
        await prisma.refreshToken.deleteMany({ where: { userId: userId } });
        //... diğer ilişkili verileri sil...
        await prisma.user.delete({ where: { id: userId } });

        return Response.ok(res, 'Hesabınız kalıcı olarak silindi.');
    } catch (error) {
        console.error('Hesap silme hatası:', error);
        return Response.internalServerError(res, 'Hesap silinirken bir hata oluştu.');
    }
};
