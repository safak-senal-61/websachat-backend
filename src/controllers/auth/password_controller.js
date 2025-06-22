// src/controllers/auth/password_controller.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { sendPasswordResetEmail } = require('../../utils/mailer');
const { generatePasswordResetToken } = require('./utils');
const { PASSWORD_RESET_SECRET, CLIENT_URL } = require('./constants');

/**
 * Şifre sıfırlama talebi oluşturur ve e-posta gönderir.
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return Response.badRequest(res, 'E-posta adresi zorunludur.');

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (user) {
      const resetToken = generatePasswordResetToken(user.id, user.email);
      const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}`;
      await sendPasswordResetEmail(user.email, user.nickname || user.username, resetLink);
    }
    return Response.ok(res, 'Eğer e-posta kayıtlıysa, şifre sıfırlama linki gönderilmiştir.');
  } catch (error) {
    console.error('Şifremi unuttum hatası:', error);
    return Response.internalServerError(res, 'İstek işlenirken bir hata oluştu.');
  }
};

/**
 * Şifre sıfırlama token'ının geçerliliğini kontrol eder.
 */
const validatePasswordResetToken = async (req, res) => {
  const { token } = req.query;
  if (!token) return Response.badRequest(res, 'Token eksik.');

  try {
    const decoded = jwt.verify(token, PASSWORD_RESET_SECRET);
    if (decoded.type !== 'password_reset') return Response.badRequest(res, 'Geçersiz token tipi.');
    
    // YENİ KONTROL: Token oluşturulduktan sonra şifre değiştirilmiş mi?
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (user && user.passwordChangedAt && (decoded.iat * 1000) < user.passwordChangedAt.getTime()) {
      return Response.unauthorized(res, 'Bu şifre sıfırlama linki zaten kullanılmış veya geçersiz kılınmıştır.');
    }

    return Response.ok(res, 'Şifre sıfırlama token\'ı geçerli.');
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) return Response.unauthorized(res, 'Token süresi dolmuş.');
    if (error instanceof jwt.JsonWebTokenError) return Response.badRequest(res, 'Token geçersiz.');
    return Response.internalServerError(res, 'Token doğrulaması sırasında hata oluştu.');
  }
};

/**
 * Token ve yeni şifre ile şifreyi günceller.
 */
const resetPassword = async (req, res) => {
  const { token } = req.query;
  const { password, confirmPassword } = req.body;

  if (!token) return Response.badRequest(res, 'Token eksik.');
  if (!password || password !== confirmPassword) return Response.badRequest(res, 'Şifreler eşleşmiyor.');
  if (password.length < 8) return Response.badRequest(res, 'Şifre en az 8 karakter olmalıdır.');

  try {
    const decoded = jwt.verify(token, PASSWORD_RESET_SECRET);
    if (decoded.type !== 'password_reset') return Response.badRequest(res, 'Geçersiz token.');

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return Response.notFound(res, 'Kullanıcı bulunamadı.');

    // YENİ EKLENEN KONTROL: Token, son şifre değişikliğinden önce mi oluşturulmuş?
    // Bu, linkin tekrar kullanılmasını engeller.
    if (user.passwordChangedAt && (decoded.iat * 1000) < user.passwordChangedAt.getTime()) {
      return Response.unauthorized(res, 'Bu şifre sıfırlama linki zaten kullanılmış veya geçersiz kılınmıştır.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date() // <-- YENİ EKLENEN ALAN: Şifre değiştirme zamanını güncelle
      },
    });
    
    // Güvenlik için tüm refresh token'larını sil
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    return Response.ok(res, 'Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.');
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) return Response.unauthorized(res, 'Token süresi dolmuş.');
    if (error instanceof jwt.JsonWebTokenError) return Response.badRequest(res, 'Token geçersiz.');
    console.error('Şifre sıfırlama hatası:', error);
    return Response.internalServerError(res, 'Şifre sıfırlanırken bir hata oluştu.');
  }
};

module.exports = {
  forgotPassword,
  validatePasswordResetToken,
  resetPassword,
};