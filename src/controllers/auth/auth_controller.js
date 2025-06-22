// src/controllers/auth/auth_controller.js

const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const jwt = require('jsonwebtoken');
const { PrismaClient, UserRole } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { sanitizeUser, generateTokens } = require('./utils');
const { 
  REFRESH_TOKEN_COOKIE_NAME, 
  JWT_REFRESH_SECRET, 
  GLOBAL_COOKIE_PATH, 
  ACCESS_TOKEN_COOKIE_NAME 
} = require('./constants');

/**
 * Kullanıcı giriş işlemi ve 2FA kontrolü.
 */
const login = async (req, res) => {
  const { loginIdentifier, password, twoFactorToken, backupCode } = req.body;
  if (!loginIdentifier || !password) {
    return Response.badRequest(res, 'Kullanıcı adı/e-posta ve şifre zorunludur.');
  }

  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ username: loginIdentifier }, { email: loginIdentifier }] },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return Response.unauthorized(res, 'Sağlanan kimlik bilgileri geçersiz.');
    }
    if (user.role !== UserRole.ADMIN && !user.isEmailVerified) {
      return Response.forbidden(res, 'Giriş yapmadan önce e-postanızı doğrulamanız gerekmektedir.');
    }
    if (['SUSPENDED', 'BANNED'].includes(user.accountStatus)) {
      return Response.forbidden(res, `Hesabınızın durumu: ${user.accountStatus}. Giriş yapamazsınız.`);
    }

    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (twoFactorToken) {
        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: twoFactorToken,
          window: 1,
        });
        if (!verified) return Response.unauthorized(res, 'Girilen 2FA kodu geçersiz.');
      } else if (backupCode) {
        return Response.notImplemented(res, "Backup code logic not fully implemented yet.");
      } else {
        return Response.ok(res, 'Şifre doğrulandı. Lütfen 2FA kodunuzu girin.', { twoFactorRequired: true, userId: user.id });
      }
    }

    // `generateTokens` çağrısına `req` eklendi.
    const tokenData = await generateTokens(user, res, req);
    return Response.ok(res, 'Giriş başarılı.', {
      tokenlar: tokenData,
      kullanici: sanitizeUser(user),
      twoFactorRequired: false,
    });

  } catch (error) {
    console.error('Giriş sırasında hata:', error);
    return Response.internalServerError(res, 'Giriş sırasında bir sunucu hatası oluştu.');
  }
};

/**
 * Refresh token kullanarak yeni bir access token alır.
 */
const refreshToken = async (req, res) => {
  const providedRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
  if (!providedRefreshToken) {
    return Response.unauthorized(res, 'Oturum bulunamadı. Lütfen tekrar giriş yapın.');
  }

  try {
    const decoded = jwt.verify(providedRefreshToken, JWT_REFRESH_SECRET);

    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: providedRefreshToken },
    });
    if (!dbToken || dbToken.userId !== decoded.userId) {
      throw new Error('Geçersiz refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    // Oturumun `lastUsedAt` zamanını güncelle
    await prisma.refreshToken.update({
        where: { token: providedRefreshToken },
        data: { lastUsedAt: new Date() }
    });

    // `generateTokens` çağrısına `req` eklendi.
    const tokenData = await generateTokens(user, res, req);
    
    return Response.ok(res, 'Oturum başarıyla yenilendi.', {
      accessToken: tokenData.accessToken,
      kullanici: sanitizeUser(user),
    });

  } catch (error) {
    console.error('Refresh token hatası:', error.message);
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, { path: GLOBAL_COOKIE_PATH });
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: GLOBAL_COOKIE_PATH });
    return Response.unauthorized(res, 'Oturumunuz geçersiz veya süresi dolmuş. Lütfen tekrar giriş yapın.');
  }
};

/**
 * Kullanıcı çıkış işlemi.
 */
const logout = async (req, res) => {
  const providedRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
  
  const cookieOptionsForClearing = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: GLOBAL_COOKIE_PATH,
    expires: new Date(0),
  };

  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, cookieOptionsForClearing);
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, cookieOptionsForClearing);
  
  if (providedRefreshToken) {
    try {
      await prisma.refreshToken.deleteMany({ where: { token: providedRefreshToken } });
      console.log(`[AuthCtrl/logout] Refresh token veritabanından silindi.`);
    } catch (error) {
      console.error('Çıkış sırasında DB hatası:', error);
    }
  }
  
  return Response.ok(res, 'Başarıyla çıkış yaptınız.');
};

/**
 * Kullanıcının aktif oturumlarını listeler.
 */
const getActiveSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const currentRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    const sessions = await prisma.refreshToken.findMany({
      where: { userId },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        lastUsedAt: true,
        createdAt: true,
        token: true, // Sadece mevcut token'ı belirlemek için
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    });

    // Token bilgisini client'a göndermeden önce temizle
    const sanitizedSessions = sessions.map(session => {
        const isCurrentSession = session.token === currentRefreshToken;
        // eslint-disable-next-line no-unused-vars
        const { token, ...rest } = session;
        return { ...rest, isCurrentSession };
    });

    return Response.ok(res, 'Aktif oturumlar başarıyla getirildi.', { sessions: sanitizedSessions });
  } catch (error) {
    console.error('Oturumları getirirken hata:', error);
    return Response.internalServerError(res, 'Oturumlar getirilemedi.');
  }
};

/**
 * Mevcut oturum hariç tüm oturumları kapatır.
 */
const logoutAllDevices = async (req, res) => {
    try {
        const userId = req.user.userId;
        const currentRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

        if (!currentRefreshToken) {
            return Response.badRequest(res, "Mevcut oturum bilgisi bulunamadı.");
        }

        await prisma.refreshToken.deleteMany({
            where: {
                userId: userId,
                NOT: {
                    token: currentRefreshToken,
                },
            },
        });

        return Response.ok(res, 'Diğer tüm cihazlardaki oturumlar başarıyla sonlandırıldı.');
    } catch (error) {
        console.error('Tüm oturumları kapatma hatası:', error);
        return Response.internalServerError(res, 'Oturumlar kapatılamadı.');
    }
};

module.exports = {
  login,
  refreshToken,
  logout,
  getActiveSessions,
  logoutAllDevices,
};