// src/controllers/auth/role_controller.js

const { PrismaClient, UserRole } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

/**
 * Kullanıcı rollerini listeler
 */
const listRoles = async (req, res) => {
  try {
    // Sadece ADMIN rolüne sahip kullanıcılar bu işlemi yapabilir
    if (req.user.role !== UserRole.ADMIN) {
      return Response.forbidden(res, 'Bu işlemi yapmak için yetkiniz yok.');
    }
    
    // Tüm rolleri getir
    const roles = Object.values(UserRole);
    
    return Response.ok(res, 'Roller başarıyla getirildi.', { roles });
  } catch (error) {
    console.error('Rolleri getirme hatası:', error);
    return Response.internalServerError(res, 'Roller getirilemedi.');
  }
};

/**
 * Kullanıcının rolünü günceller
 */
const updateUserRole = async (req, res) => {
  try {
    // Sadece ADMIN rolüne sahip kullanıcılar bu işlemi yapabilir
    if (req.user.role !== UserRole.ADMIN) {
      return Response.forbidden(res, 'Bu işlemi yapmak için yetkiniz yok.');
    }
    
    const { userId, role } = req.body;
    
    if (!userId || !role) {
      return Response.badRequest(res, 'Kullanıcı ID ve rol gereklidir.');
    }
    
    // Rolün geçerli olup olmadığını kontrol et
    if (!Object.values(UserRole).includes(role)) {
      return Response.badRequest(res, 'Geçersiz rol.');
    }
    
    // Kullanıcının var olup olmadığını kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    
    if (!user) {
      return Response.notFound(res, 'Kullanıcı bulunamadı.');
    }
    
    // Kullanıcının rolünü güncelle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, username: true, email: true, role: true },
    });
    
    return Response.ok(res, 'Kullanıcı rolü başarıyla güncellendi.', { user: updatedUser });
  } catch (error) {
    console.error('Kullanıcı rolü güncelleme hatası:', error);
    return Response.internalServerError(res, 'Kullanıcı rolü güncellenemedi.');
  }
};

/**
 * Kullanıcının izinlerini listeler
 */
const listUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Sadece ADMIN rolüne sahip kullanıcılar veya kendisi bu işlemi yapabilir
    if (req.user.role !== UserRole.ADMIN && req.user.userId !== userId) {
      return Response.forbidden(res, 'Bu işlemi yapmak için yetkiniz yok.');
    }
    
    // Kullanıcının var olup olmadığını kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, permissions: true },
    });
    
    if (!user) {
      return Response.notFound(res, 'Kullanıcı bulunamadı.');
    }
    
    // Rol bazlı varsayılan izinleri tanımla
    const defaultPermissions = {
      [UserRole.ADMIN]: ['all'],
      [UserRole.MODERATOR]: ['read', 'write', 'moderate'],
      [UserRole.USER]: ['read', 'write'],
      [UserRole.GUEST]: ['read'],
    };
    
    // Kullanıcının özel izinleri ve rol bazlı izinleri birleştir
    const permissions = {
      role: user.role,
      defaultPermissions: defaultPermissions[user.role] || [],
      customPermissions: user.permissions || [],
    };
    
    return Response.ok(res, 'Kullanıcı izinleri başarıyla getirildi.', { permissions });
  } catch (error) {
    console.error('Kullanıcı izinlerini getirme hatası:', error);
    return Response.internalServerError(res, 'Kullanıcı izinleri getirilemedi.');
  }
};

/**
 * Kullanıcının özel izinlerini günceller
 */
const updateUserPermissions = async (req, res) => {
  try {
    // Sadece ADMIN rolüne sahip kullanıcılar bu işlemi yapabilir
    if (req.user.role !== UserRole.ADMIN) {
      return Response.forbidden(res, 'Bu işlemi yapmak için yetkiniz yok.');
    }
    
    const { userId } = req.params;
    const { permissions } = req.body;
    
    if (!userId || !permissions || !Array.isArray(permissions)) {
      return Response.badRequest(res, 'Kullanıcı ID ve izinler dizisi gereklidir.');
    }
    
    // Kullanıcının var olup olmadığını kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    
    if (!user) {
      return Response.notFound(res, 'Kullanıcı bulunamadı.');
    }
    
    // Kullanıcının özel izinlerini güncelle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { permissions },
      select: { id: true, username: true, email: true, role: true, permissions: true },
    });
    
    return Response.ok(res, 'Kullanıcı izinleri başarıyla güncellendi.', { user: updatedUser });
  } catch (error) {
    console.error('Kullanıcı izinleri güncelleme hatası:', error);
    return Response.internalServerError(res, 'Kullanıcı izinleri güncellenemedi.');
  }
};

module.exports = {
  listRoles,
  updateUserRole,
  listUserPermissions,
  updateUserPermissions,
};