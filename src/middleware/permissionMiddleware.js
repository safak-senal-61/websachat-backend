// src/middleware/permissionMiddleware.js

const { PrismaClient, UserRole } = require('../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../utils/responseHandler');

/**
 * Kullanıcının belirli bir role sahip olup olmadığını kontrol eden middleware
 * @param {Array<string>} roles - İzin verilen roller dizisi
 * @returns {Function} Middleware fonksiyonu
 */
const hasRole = (roles) => {
  return async (req, res, next) => {
    try {
      // Kullanıcı kimlik doğrulaması yapılmış olmalı
      if (!req.user || !req.user.userId) {
        return Response.unauthorized(res, 'Bu işlemi yapmak için giriş yapmalısınız.');
      }

      // Kullanıcı bilgilerini veritabanından al
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true },
      });

      if (!user) {
        return Response.unauthorized(res, 'Kullanıcı bulunamadı.');
      }

      // ADMIN rolü her zaman tüm işlemleri yapabilir
      if (user.role === UserRole.ADMIN) {
        return next();
      }

      // Kullanıcının rolü izin verilen roller arasında mı kontrol et
      if (roles.includes(user.role)) {
        return next();
      }

      return Response.forbidden(res, 'Bu işlemi yapmak için yetkiniz yok.');
    } catch (error) {
      console.error('Rol kontrolü hatası:', error);
      return Response.internalServerError(res, 'Rol kontrolü yapılırken bir hata oluştu.');
    }
  };
};

/**
 * Kullanıcının belirli izinlere sahip olup olmadığını kontrol eden middleware
 * @param {Array<string>} requiredPermissions - Gerekli izinler dizisi
 * @returns {Function} Middleware fonksiyonu
 */
const hasPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      // Kullanıcı kimlik doğrulaması yapılmış olmalı
      if (!req.user || !req.user.userId) {
        return Response.unauthorized(res, 'Bu işlemi yapmak için giriş yapmalısınız.');
      }

      // Kullanıcı bilgilerini veritabanından al
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true, permissions: true },
      });

      if (!user) {
        return Response.unauthorized(res, 'Kullanıcı bulunamadı.');
      }

      // ADMIN rolü her zaman tüm izinlere sahiptir
      if (user.role === UserRole.ADMIN) {
        return next();
      }

      // Rol bazlı varsayılan izinleri tanımla
      const defaultPermissions = {
        [UserRole.ADMIN]: ['all'],
        [UserRole.MODERATOR]: ['read', 'write', 'moderate'],
        [UserRole.USER]: ['read', 'write'],
        [UserRole.GUEST]: ['read'],
      };

      // Kullanıcının tüm izinlerini birleştir (rol bazlı + özel izinler)
      const userPermissions = [
        ...(defaultPermissions[user.role] || []),
        ...(user.permissions || []),
      ];

      // 'all' izni varsa, tüm işlemlere izin ver
      if (userPermissions.includes('all')) {
        return next();
      }

      // Kullanıcının gerekli tüm izinlere sahip olup olmadığını kontrol et
      const hasAllRequiredPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (hasAllRequiredPermissions) {
        return next();
      }

      return Response.forbidden(res, 'Bu işlemi yapmak için gerekli izinlere sahip değilsiniz.');
    } catch (error) {
      console.error('İzin kontrolü hatası:', error);
      return Response.internalServerError(res, 'İzin kontrolü yapılırken bir hata oluştu.');
    }
  };
};

module.exports = {
  hasRole,
  hasPermission,
};