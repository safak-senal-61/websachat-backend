// src/controllers/auth/authjs_controller.js

const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { sanitizeUser } = require('./utils');
const authConfig = require('./authjs_config');
const speakeasy = require('speakeasy');
const bcrypt = require('bcrypt');

// ESM wrapper'ını dinamik olarak import eden yardımcı fonksiyon
const getExpressAuth = async () => {
  const wrapper = await import('../../utils/authWrapper.mjs');
  return wrapper.default; // wrapper.mjs'den varsayılan olarak ihraç edilen ExpressAuth fonksiyonunu al
};

/**
 * Auth.js ile oturum başlatma
 */
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return Response.badRequest(res, 'E-posta ve şifre zorunludur.');
    }
    
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return Response.unauthorized(res, 'Kullanıcı bulunamadı.');
    }
    
    // Şifre doğrulama
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return Response.unauthorized(res, 'Geçersiz şifre.');
    }
    
    if (user.twoFactorEnabled) {
      return Response.ok(res, 'İki faktörlü doğrulama gerekli.', {
        twoFactorRequired: true,
        userId: user.id,
        email: user.email
      });
    }
    
    // Auth.js session oluşturma
    // Request'i Auth.js için hazırla
    req.body = {
      ...req.body,
      userId: user.id,
      verified: true
    };
    
    const ExpressAuth = await getExpressAuth();
    return ExpressAuth(req, res, authConfig);
    
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
    const ExpressAuth = await getExpressAuth();
    
    // Çıkış için özel bir endpoint oluştur
    const originalUrl = req.url;
    const originalMethod = req.method;
    
    req.url = '/auth/signout';
    req.method = 'POST';
    
    const result = await ExpressAuth(req, res, authConfig);
    
    // Orijinal değerleri geri yükle
    req.url = originalUrl;
    req.method = originalMethod;
    
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
    const ExpressAuth = await getExpressAuth();
    
    // Session için özel endpoint
    const originalUrl = req.url;
    const originalMethod = req.method;
    
    req.url = '/auth/session';
    req.method = 'GET';
    
    // Response'u yakalamak için custom response object
    let sessionData = null;
    const originalJson = res.json;
    res.json = function(data) {
      sessionData = data;
      return originalJson.call(this, data);
    };
    
    await ExpressAuth(req, res, authConfig);
    
    // Orijinal değerleri geri yükle
    req.url = originalUrl;
    req.method = originalMethod;
    res.json = originalJson;
    
    if (!sessionData) {
      return Response.unauthorized(res, 'Oturum bulunamadı.');
    }
    
    return Response.ok(res, 'Oturum bilgileri başarıyla getirildi.', { session: sessionData });
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
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return Response.unauthorized(res, 'Kullanıcı bulunamadı veya 2FA etkin değil.');
    }
    
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorToken,
      window: 1,
    });
    
    if (!verified) {
      return Response.unauthorized(res, 'Geçersiz 2FA kodu.');
    }
    
    // 2FA doğrulandıktan sonra session oluştur
    req.body = {
      ...req.body,
      userId: user.id,
      verified: true,
      twoFactorVerified: true
    };
    
    const ExpressAuth = await getExpressAuth();
    return ExpressAuth(req, res, authConfig);
    
  } catch (error) {
    console.error('2FA doğrulama hatası:', error);
    return Response.internalServerError(res, '2FA doğrulama sırasında bir hata oluştu.');
  }
};

/**
 * Manuel JWT tabanlı giriş (alternatif yaklaşım)
 */
const signInWithJWT = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return Response.badRequest(res, 'E-posta ve şifre zorunludur.');
    }
    
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return Response.unauthorized(res, 'Kullanıcı bulunamadı.');
    }
    
    // Şifre doğrulama
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return Response.unauthorized(res, 'Geçersiz şifre.');
    }
    
    if (user.twoFactorEnabled) {
      return Response.ok(res, 'İki faktörlü doğrulama gerekli.', {
        twoFactorRequired: true,
        userId: user.id,
        email: user.email
      });
    }
    
    // JWT token oluştur
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Cookie'ye kaydet
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 saat
    });
    
    return Response.ok(res, 'Giriş başarılı.', {
      user: sanitizeUser(user),
      token
    });
    
  } catch (error) {
    console.error('JWT giriş hatası:', error);
    return Response.internalServerError(res, 'Giriş sırasında bir hata oluştu.');
  }
};

/**
 * JWT tabanlı çıkış
 */
const signOutWithJWT = async (req, res) => {
  try {
    // Cookie'yi temizle
    res.clearCookie('auth-token');
    
    return Response.ok(res, 'Çıkış başarılı.');
  } catch (error) {
    console.error('JWT çıkış hatası:', error);
    return Response.internalServerError(res, 'Çıkış sırasında bir hata oluştu.');
  }
};

/**
 * JWT tabanlı session kontrolü
 */
const getSessionWithJWT = async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.cookies['auth-token'] || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return Response.unauthorized(res, 'Token bulunamadı.');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    
    if (!user) {
      return Response.unauthorized(res, 'Kullanıcı bulunamadı.');
    }
    
    return Response.ok(res, 'Oturum bilgileri başarıyla getirildi.', {
      user: sanitizeUser(user),
      token
    });
    
  } catch (error) {
    console.error('JWT session hatası:', error);
    return Response.unauthorized(res, 'Geçersiz token.');
  }
};

module.exports = {
  // Auth.js tabanlı fonksiyonlar
  signIn,
  signOut,
  getSession,
  verifyTwoFactor,
  
  // JWT tabanlı alternatif fonksiyonlar
  signInWithJWT,
  signOutWithJWT,
  getSessionWithJWT
};