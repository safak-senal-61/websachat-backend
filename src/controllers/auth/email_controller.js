// src/controllers/auth/email.controller.js

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { sendAccountActivationEmail } = require('../../utils/mailer');
const { generateEmailVerificationToken } = require('./utils');
const { EMAIL_VERIFICATION_SECRET, CLIENT_URL } = require('./constants');

/**
 * Gelen token ile e-posta adresini doğrular.
 */
const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) return Response.badRequest(res, 'Doğrulama token\'ı eksik.');

  try {
    const decoded = jwt.verify(token, EMAIL_VERIFICATION_SECRET);
    if (decoded.type !== 'email_verification') {
      return Response.badRequest(res, 'Geçersiz token tipi.');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return Response.notFound(res, 'Kullanıcı bulunamadı.');
    if (user.isEmailVerified) return Response.ok(res, 'E-posta zaten doğrulanmış.');

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });
    return Response.ok(res, 'E-posta başarıyla doğrulandı. Artık giriş yapabilirsiniz.');
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) return Response.unauthorized(res, 'Token süresi dolmuş.');
    if (error instanceof jwt.JsonWebTokenError) return Response.badRequest(res, 'Token geçersiz.');
    console.error('E-posta doğrulama hatası:', error);
    return Response.internalServerError(res, 'E-posta doğrulaması sırasında hata oluştu.');
  }
};

/**
 * Doğrulama e-postasını yeniden gönderir.
 */
const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return Response.badRequest(res, 'E-posta adresi gereklidir.');

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return Response.ok(res, 'Eğer e-posta kayıtlıysa, doğrulama linki gönderilecektir.');
    }
    if (user.isEmailVerified) {
      return Response.badRequest(res, 'Bu e-posta zaten doğrulanmış.');
    }

    const verificationToken = generateEmailVerificationToken(user.id, user.email);
    // DÜZELTME: Linkten ".html" uzantısı kaldırıldı ve doğru URL kullanıldı.
    const verificationLink = `${CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendAccountActivationEmail(user.email, user.nickname || user.username, verificationLink);
    
    return Response.ok(res, 'Yeni doğrulama e-postası gönderildi.');
  } catch (error) {
    console.error('Doğrulama e-postası yeniden gönderme hatası:', error);
    return Response.internalServerError(res, 'E-posta gönderimi sırasında bir hata oluştu.');
  }
};

module.exports = {
  verifyEmail,
  resendVerificationEmail,
};
