// src/controllers/auth/utils.js

const jwt = require('jsonwebtoken');
const ms = require('ms');
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  EMAIL_VERIFICATION_SECRET,
  EMAIL_VERIFICATION_EXPIRES_IN,
  PASSWORD_RESET_SECRET,
  PASSWORD_RESET_EXPIRES_IN,
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  GLOBAL_COOKIE_PATH,
} = require('./constants');

/**
 * Kullanıcı nesnesinden hassas ve gereksiz verileri temizler.
 * @param {object} user - Prisma'dan gelen kullanıcı nesnesi.
 * @returns {object|null} Temizlenmiş kullanıcı nesnesi.
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  // Hassas bilgileri ve gereksiz alanları çıkar
  const { password, twoFactorSecret, twoFactorRecoveryCodes, verificationToken, resetPasswordToken, ...sanitizedBaseUser } = user;
  const result = { ...sanitizedBaseUser };

  // BigInt ve Date dönüşümleri
  if (typeof user.coins === 'bigint') result.coins = user.coins.toString();
  else if (user.coins !== undefined && user.coins !== null) result.coins = String(user.coins);
  else result.coins = null;

  if (typeof user.diamonds === 'bigint') result.diamonds = user.diamonds.toString();
  else if (user.diamonds !== undefined && user.diamonds !== null) result.diamonds = String(user.diamonds);
  else result.diamonds = null;

  if (user.birthDate instanceof Date) result.birthDate = user.birthDate.toISOString().split('T')[0];
  else if (user.birthDate === null || user.birthDate === undefined) result.birthDate = null;

  result.twoFactorEnabled = !!user.twoFactorEnabled;

  return result;
};

/**
 * Access ve Refresh token'ları oluşturur, DB'ye kaydeder ve cookie olarak set eder.
 * @param {object} user - Token'ları oluşturulacak kullanıcı nesnesi.
 * @param {object} res - Express response nesnesi.
 * @param {object} req - Express request nesnesi (IP ve User-Agent almak için).
 * @returns {Promise<object>} accessToken ve süresini içeren nesne.
 */
const generateTokens = async (user, res, req) => {
  const accessTokenPayload = { userId: user.id, username: user.username, email: user.email, role: user.role };
  const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  const refreshTokenPayload = { userId: user.id, role: user.role };
  const refreshToken = jwt.sign(refreshTokenPayload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });

  const accessExpiresInMs = ms(JWT_EXPIRES_IN) || 15 * 60 * 1000;
  const refreshExpiresInMs = ms(JWT_REFRESH_EXPIRES_IN) || 7 * 24 * 60 * 60 * 1000;

  try {
    // Oturum bilgilerini al
    const ipAddress = req?.ip;
    const userAgent = req?.headers?.['user-agent']?.slice(0, 255); // User-Agent'ı kısalt

    // Refresh token'ı veritabanına yeni oturum bilgileriyle kaydet
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + refreshExpiresInMs),
        ipAddress: ipAddress,
        userAgent: userAgent,
      },
    });
  } catch (dbError) {
    console.error("Yenileme token'ı veritabanına kaydedilirken hata:", dbError);
    throw new Error("Oturum başlatılamadı: Yenileme token'ı kaydedilemedi.");
  }

  const cookieOptionsBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: GLOBAL_COOKIE_PATH,
  };

  res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, { ...cookieOptionsBase, maxAge: accessExpiresInMs });
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, { ...cookieOptionsBase, maxAge: refreshExpiresInMs });

  console.log(`[AuthUtils] Token cookies set for user ${user.id}`);

  return {
    accessToken,
    accessExpiresIn: JWT_EXPIRES_IN,
    refreshToken,
    refreshExpiresIn: JWT_REFRESH_EXPIRES_IN,
  };

};

/**
 * E-posta doğrulama için bir JWT oluşturur.
 * @param {string} userId - Kullanıcı ID'si.
 * @param {string} email - Kullanıcı e-postası.
 * @returns {string} E-posta doğrulama token'ı.
 */
const generateEmailVerificationToken = (userId, email) => {
  return jwt.sign({ userId, email, type: 'email_verification' }, EMAIL_VERIFICATION_SECRET, {
    expiresIn: EMAIL_VERIFICATION_EXPIRES_IN,
  });
};

/**
 * Şifre sıfırlama için bir JWT oluşturur.
 * @param {string} userId - Kullanıcı ID'si.
 * @param {string} email - Kullanıcı e-postası.
 * @returns {string} Şifre sıfırlama token'ı.
 */
const generatePasswordResetToken = (userId, email) => {
  return jwt.sign({ userId, email, type: 'password_reset' }, PASSWORD_RESET_SECRET, {
    expiresIn: PASSWORD_RESET_EXPIRES_IN,
  });
};

module.exports = {
  sanitizeUser,
  generateTokens,
  generateEmailVerificationToken,
  generatePasswordResetToken,
};