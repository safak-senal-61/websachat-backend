// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { UserRole } = require('../generated/prisma'); // Prisma'dan UserRole enum'u
const Response = require('../utils/responseHandler'); // Merkezi yanıt handler'ımız

// JWT_SECRET, auth_controller.js'deki ile aynı olmalı
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-strong-jwt-secret-for-access';

/**
 * Gelen istekteki Bearer token'ını doğrular ve başarılı olursa
 * kullanıcı bilgilerini (payload) req.user'a ekler.
 */
const authenticateToken = (req, res, next) => {
  console.log('DEBUG: authenticateToken middleware BAŞLADI.');
  const authHeader = req.headers['authorization'];
  // Token genellikle "Bearer TOKEN_DEGERI" formatındadır.
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  console.log('DEBUG: Gelen Authorization Header:', authHeader);
  console.log('DEBUG: Çıkarılan Token:', token);

  if (token == null) {
    console.log('DEBUG: Token bulunamadı, 401 gönderiliyor.');
    // HTTPOnly cookie'ler refresh token için kullanılır, access token hala header'da beklenir.
    return Response.unauthorized(res, 'Yetkisiz: Erişim token\'ı sağlanmadı. Lütfen giriş yapın.');
  }

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    // userPayload, token oluşturulurken içine konulan objeyi içerir.
    // Örn: { userId: '...', username: '...', email: '...', role: '...', iat: ..., exp: ... }
    console.log('DEBUG: jwt.verify callback çalıştı.');
    if (err) {
      console.error('DEBUG: jwt.verify HATA:', err.name, err.message);
      if (err.name === 'TokenExpiredError') {
        return Response.unauthorized(res, 'Yetkisiz: Erişim token\'ının süresi dolmuş. Lütfen tekrar giriş yapın veya token\'ınızı yenileyin.');
      }
      if (err.name === 'JsonWebTokenError') {
        // Bu, token'ın manipüle edildiği veya geçersiz olduğu anlamına gelebilir.
        return Response.forbidden(res, 'Yasaklandı: Geçersiz veya hatalı formatta erişim token\'ı.');
      }
      // Diğer beklenmedik JWT hataları için
      return Response.forbidden(res, 'Yasaklandı: Erişim token\'ı doğrulanamadı.');
    }

    console.log('DEBUG: jwt.verify BAŞARILI, userPayload:', userPayload);
    // Kullanıcı bilgilerini (token payload'ını) isteğe ekle.
    // Bu sayede sonraki middleware'ler veya route handler'lar req.user üzerinden bilgilere erişebilir.
    req.user = userPayload;
    next(); // Bir sonraki işleme geç
  });
};

/**
 * Belirli rollere sahip kullanıcıların bir kaynağa erişip erişemeyeceğini kontrol eder.
 * Bu fonksiyon bir middleware fabrikasıdır; çağrıldığında bir middleware fonksiyonu döndürür.
 * @param {...UserRole} allowedRoles - İzin verilen roller (UserRole enum değerleri).
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Bu middleware'in authenticateToken'dan SONRA çalışması gerekir,
    // çünkü req.user objesine ihtiyaç duyar.
    if (!req.user || !req.user.role) {
      console.warn('DEBUG: authorizeRoles - req.user veya req.user.role bulunamadı. authenticateToken middleware\'i çağrılmamış veya başarısız olmuş olabilir.');
      // Kullanıcı doğrulanmamışsa veya rol bilgisi token'da yoksa erişimi engelle.
      return Response.forbidden(res, 'Yasaklandı: Rol bilgisi alınamadı veya kullanıcı doğrulanmamış.');
    }

    const rolesArray = [...allowedRoles];
    if (!rolesArray.includes(req.user.role)) {
      console.log(`DEBUG: authorizeRoles - Yetkisiz rol denemesi. Kullanıcı rolü: ${req.user.role}, İzin verilen roller: ${rolesArray.join(', ')}`);
      return Response.forbidden(res, `Yasaklandı: '${req.user.role}' rolü bu kaynağa erişim için yetkili değil.`);
    }

    // Kullanıcının rolü izin verilen rollerden biri, devam et.
    next();
  };
};

// Kullanım kolaylığı için spesifik rol yetkilendirme middleware'leri
const isAdmin = authorizeRoles(UserRole.ADMIN);
const isUser = authorizeRoles(UserRole.USER);
const isWip = authorizeRoles(UserRole.WIP);
// Birden fazla rol için de tanımlanabilir:
// const isAdminOrWip = authorizeRoles(UserRole.ADMIN, UserRole.WIP);

module.exports = {
  authenticateToken,
  authorizeRoles, // Genel rol yetkilendirme fonksiyonu
  isAdmin,        // Sadece adminler için kısayol
  isUser,         // Sadece standart kullanıcılar için kısayol
  isWip,          // Sadece WIP kullanıcıları için kısayol
  // isAdminOrWip, // Örnek
};