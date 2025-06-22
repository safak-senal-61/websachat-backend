// src/controllers/auth/apikey_controller.js

const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const crypto = require('crypto');

/**
 * API anahtarı oluşturur
 */
const createApiKey = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, expiresIn, permissions } = req.body;
    
    if (!name) {
      return Response.badRequest(res, 'API anahtarı için bir isim gereklidir.');
    }
    
    // API anahtarı oluştur
    const apiKey = crypto.randomBytes(32).toString('hex');
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    // Varsayılan son kullanma tarihi: 1 yıl
    const expiresAt = expiresIn 
      ? new Date(Date.now() + parseInt(expiresIn) * 1000) 
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    
    // API anahtarını veritabanına kaydet
    const createdApiKey = await prisma.apiKey.create({
      data: {
        name,
        key: apiKeyHash,
        expiresAt,
        permissions: permissions || ['read'],
        user: { connect: { id: userId } },
      },
    });
    
    return Response.created(res, 'API anahtarı başarıyla oluşturuldu.', {
      id: createdApiKey.id,
      name: createdApiKey.name,
      key: apiKey, // Sadece oluşturma sırasında tam anahtarı göster
      expiresAt: createdApiKey.expiresAt,
      permissions: createdApiKey.permissions,
      createdAt: createdApiKey.createdAt,
    });
  } catch (error) {
    console.error('API anahtarı oluşturma hatası:', error);
    return Response.internalServerError(res, 'API anahtarı oluşturulamadı.');
  }
};

/**
 * Kullanıcının API anahtarlarını listeler
 */
const listApiKeys = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Kullanıcının API anahtarlarını getir
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        expiresAt: true,
        permissions: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return Response.ok(res, 'API anahtarları başarıyla getirildi.', { apiKeys });
  } catch (error) {
    console.error('API anahtarlarını getirme hatası:', error);
    return Response.internalServerError(res, 'API anahtarları getirilemedi.');
  }
};

/**
 * API anahtarını siler
 */
const deleteApiKey = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { apiKeyId } = req.params;
    
    if (!apiKeyId) {
      return Response.badRequest(res, 'API anahtarı ID gereklidir.');
    }
    
    // API anahtarının kullanıcıya ait olup olmadığını kontrol et
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: apiKeyId },
      select: { userId: true },
    });
    
    if (!apiKey || apiKey.userId !== userId) {
      return Response.forbidden(res, 'Bu API anahtarını silme yetkiniz yok.');
    }
    
    // API anahtarını sil
    await prisma.apiKey.delete({
      where: { id: apiKeyId },
    });
    
    return Response.ok(res, 'API anahtarı başarıyla silindi.');
  } catch (error) {
    console.error('API anahtarı silme hatası:', error);
    return Response.internalServerError(res, 'API anahtarı silinemedi.');
  }
};

/**
 * API anahtarını yeniler
 */
const renewApiKey = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { apiKeyId } = req.params;
    
    if (!apiKeyId) {
      return Response.badRequest(res, 'API anahtarı ID gereklidir.');
    }
    
    // API anahtarının kullanıcıya ait olup olmadığını kontrol et
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: apiKeyId },
      select: { userId: true, name: true, permissions: true },
    });
    
    if (!apiKey || apiKey.userId !== userId) {
      return Response.forbidden(res, 'Bu API anahtarını yenileme yetkiniz yok.');
    }
    
    // Yeni API anahtarı oluştur
    const newApiKey = crypto.randomBytes(32).toString('hex');
    const newApiKeyHash = crypto.createHash('sha256').update(newApiKey).digest('hex');
    
    // Varsayılan son kullanma tarihi: 1 yıl
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    
    // API anahtarını güncelle
    const updatedApiKey = await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: {
        key: newApiKeyHash,
        expiresAt,
        updatedAt: new Date(),
      },
    });
    
    return Response.ok(res, 'API anahtarı başarıyla yenilendi.', {
      id: updatedApiKey.id,
      name: updatedApiKey.name,
      key: newApiKey, // Sadece yenileme sırasında tam anahtarı göster
      expiresAt: updatedApiKey.expiresAt,
      permissions: updatedApiKey.permissions,
      createdAt: updatedApiKey.createdAt,
      updatedAt: updatedApiKey.updatedAt,
    });
  } catch (error) {
    console.error('API anahtarı yenileme hatası:', error);
    return Response.internalServerError(res, 'API anahtarı yenilenemedi.');
  }
};

module.exports = {
  createApiKey,
  listApiKeys,
  deleteApiKey,
  renewApiKey,
};