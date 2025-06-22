// src/controllers/auth/constants.js

/**
 * Bu dosya, kimlik doğrulama işlemleri için gerekli olan tüm sabitleri ve
 * .env dosyasından okunan yapılandırma değerlerini içerir.
 * Bu sayede yapılandırma değerleri merkezi bir yerden yönetilir.
 */

// JWT (JSON Web Token) Ayarları
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-strong-jwt-secret-for-access';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-very-strong-jwt-secret-for-refresh';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Özel Kayıt Anahtarları
const ADMIN_SECRET = process.env.ADMIN_REGISTRATION_SECRET;
const WIP_SECRET = process.env.WIP_REGISTRATION_SECRET;

// Token ve E-posta Ayarları
const EMAIL_VERIFICATION_SECRET = process.env.EMAIL_VERIFICATION_SECRET || 'your-email-verification-secret';
const EMAIL_VERIFICATION_EXPIRES_IN = process.env.EMAIL_VERIFICATION_EXPIRES_IN || '1d';
const PASSWORD_RESET_SECRET = process.env.PASSWORD_RESET_SECRET || 'your-password-reset-secret';
const PASSWORD_RESET_EXPIRES_IN = process.env.PASSWORD_RESET_EXPIRES_IN || '1h';

// Frontend Uygulama URL'si (E-posta linkleri için)
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3001';

// Cookie Ayarları
const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
const GLOBAL_COOKIE_PATH = '/';

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  ADMIN_SECRET,
  WIP_SECRET,
  EMAIL_VERIFICATION_SECRET,
  EMAIL_VERIFICATION_EXPIRES_IN,
  PASSWORD_RESET_SECRET,
  PASSWORD_RESET_EXPIRES_IN,
  CLIENT_URL, // APP_BASE_URL yerine bunu kullanacağız
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  GLOBAL_COOKIE_PATH,
};