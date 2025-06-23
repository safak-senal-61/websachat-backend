// src/controllers/auth/authjs_controller.js

const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { sanitizeUser } = require('./utils');
const authConfig = require('./authjs_config');
const speakeasy = require('speakeasy');

// ESM wrapper'ı import et
const getAuthWrapper = async () => {
  const wrapper = await import('../../utils/authWrapper.mjs');
  return wrapper;
};

/**
 * Auth.js ile oturum başlatma
 */
const signIn = async (req, res) => {
  try {
    const { email, password, provider } = req.body;
    
    if (!email || !password) {
      return Response.badRequest(res, 'E-posta ve şifre zorunludur.');
    }
    
    // Kullanıcıyı veritabanında ara
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return Response.unauthorized(res, 'Kullanıcı bulunamadı.');
    }
    
    // 2FA kontrolü
    if (user.twoFactorEnabled) {
      return Response.ok(res, 'İki faktörlü doğrulama gerekli.', {
        twoFactorRequired: true,
        userId: user.id,
        email: user.email
      });
    }
    
    // Auth wrapper'ı kullan
    const { createExpressAuth } = await getAuthWrapper();
    const auth = await createExpressAuth(req, res, authConfig);
    const session = await auth.signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    
    if (!session) {
      return Response.unauthorized(res, 'Giriş başarısız.');
    }
    
    return Response.ok(res, 'Giriş başarılı.', {
      user: sanitizeUser(user),
      session
    });
  } catch (error) {
    console.error('Auth.js giriş hatası:', error);
    return Response.internalServerError(res, 'Giriş sırasında bir hata oluştu.');
  }
};

/**
 * Auth.js ile oturum sonlandırma
 */
const signOut = async (req, res) => {
  try {
    const { createExpressAuth } = await getAuthWrapper();
    const auth = await createExpressAuth(req, res, authConfig);
    await auth.signOut();
    return Response.ok(res, 'Çıkış başarılı.');
  } catch (error) {
    console.error('Auth.js çıkış hatası:', error);
    return Response.internalServerError(res, 'Çıkış sırasında bir hata oluştu.');
  }
};

/**
 * Auth.js ile oturum bilgilerini getirme
 */
const getSession = async (req, res) => {
  try {
    const { createExpressAuth } = await getAuthWrapper();
    const auth = await createExpressAuth(req, res, authConfig);
    const session = await auth.getSession();
    
    if (!session) {
      return Response.unauthorized(res, 'Oturum bulunamadı.');
    }
    
    return Response.ok(res, 'Oturum bilgileri başarıyla getirildi.', { session });
  } catch (error) {
    console.error('Auth.js oturum bilgisi hatası:', error);
    return Response.internalServerError(res, 'Oturum bilgileri getirilirken bir hata oluştu.');
  }
};

/**
 * İki faktörlü doğrulama ile giriş
 */
const verifyTwoFactor = async (req, res) => {
  try {
    const { userId, twoFactorToken } = req.body;
    
    if (!userId || !twoFactorToken) {
      return Response.badRequest(res, 'Kullanıcı ID ve 2FA kodu zorunludur.');
    }
    
    // Kullanıcıyı veritabanında ara
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return Response.unauthorized(res, 'Kullanıcı bulunamadı veya 2FA etkin değil.');
    }
    
    // 2FA kodunu doğrula
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorToken,
      window: 1,
    });
    
    if (!verified) {
      return Response.unauthorized(res, 'Geçersiz 2FA kodu.');
    }
    
    // Auth wrapper'ı kullan
    const { createExpressAuth } = await getAuthWrapper();
    const auth = await createExpressAuth(req, res, authConfig);
    const session = await auth.signIn('credentials', {
      userId: user.id,
      redirect: false,
    });
    
    if (!session) {
      return Response.unauthorized(res, 'Giriş başarısız.');
    }
    
    return Response.ok(res, 'İki faktörlü doğrulama başarılı.', {
      user: sanitizeUser(user),
      session
    });
  } catch (error) {
    console.error('2FA doğrulama hatası:', error);
    return Response.internalServerError(res, '2FA doğrulama sırasında bir hata oluştu.');
  }
};

module.exports = {
  signIn,
  signOut,
  getSession,
  verifyTwoFactor
};