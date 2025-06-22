// src/controllers/auth/device_controller.js

const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

/**
 * Kullanıcının güvenilir cihazlarını listeler
 */
const listDevices = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Kullanıcının cihazlarını getir
    const devices = await prisma.trustedDevice.findMany({
      where: { userId },
      select: {
        id: true,
        deviceName: true,
        deviceType: true,
        ipAddress: true,
        lastUsedAt: true,
        createdAt: true,
        isCurrentDevice: true,
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    });
    
    return Response.ok(res, 'Güvenilir cihazlar başarıyla getirildi.', { devices });
  } catch (error) {
    console.error('Cihazları getirme hatası:', error);
    return Response.internalServerError(res, 'Cihazlar getirilemedi.');
  }
};

/**
 * Yeni bir güvenilir cihaz ekler
 */
const addDevice = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { deviceName, deviceType } = req.body;
    
    if (!deviceName) {
      return Response.badRequest(res, 'Cihaz adı gereklidir.');
    }
    
    // Cihaz bilgilerini al
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    
    // Cihazı veritabanına ekle
    const device = await prisma.trustedDevice.create({
      data: {
        userId,
        deviceName,
        deviceType: deviceType || 'unknown',
        ipAddress,
        userAgent,
        isCurrentDevice: true,
        lastUsedAt: new Date(),
      },
    });
    
    return Response.created(res, 'Güvenilir cihaz başarıyla eklendi.', { device });
  } catch (error) {
    console.error('Cihaz ekleme hatası:', error);
    return Response.internalServerError(res, 'Cihaz eklenemedi.');
  }
};

/**
 * Güvenilir cihazı siler
 */
const removeDevice = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { deviceId } = req.params;
    
    if (!deviceId) {
      return Response.badRequest(res, 'Cihaz ID gereklidir.');
    }
    
    // Cihazın kullanıcıya ait olup olmadığını kontrol et
    const device = await prisma.trustedDevice.findUnique({
      where: { id: deviceId },
      select: { userId: true, isCurrentDevice: true },
    });
    
    if (!device || device.userId !== userId) {
      return Response.forbidden(res, 'Bu cihazı silme yetkiniz yok.');
    }
    
    // Mevcut cihazı silmeye çalışıyorsa uyarı ver
    if (device.isCurrentDevice) {
      return Response.badRequest(res, 'Şu anda kullandığınız cihazı silemezsiniz.');
    }
    
    // Cihazı sil
    await prisma.trustedDevice.delete({
      where: { id: deviceId },
    });
    
    return Response.ok(res, 'Güvenilir cihaz başarıyla silindi.');
  } catch (error) {
    console.error('Cihaz silme hatası:', error);
    return Response.internalServerError(res, 'Cihaz silinemedi.');
  }
};

/**
 * Cihaz adını günceller
 */
const updateDeviceName = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { deviceId } = req.params;
    const { deviceName } = req.body;
    
    if (!deviceId || !deviceName) {
      return Response.badRequest(res, 'Cihaz ID ve yeni cihaz adı gereklidir.');
    }
    
    // Cihazın kullanıcıya ait olup olmadığını kontrol et
    const device = await prisma.trustedDevice.findUnique({
      where: { id: deviceId },
      select: { userId: true },
    });
    
    if (!device || device.userId !== userId) {
      return Response.forbidden(res, 'Bu cihazı güncelleme yetkiniz yok.');
    }
    
    // Cihaz adını güncelle
    const updatedDevice = await prisma.trustedDevice.update({
      where: { id: deviceId },
      data: { deviceName },
    });
    
    return Response.ok(res, 'Cihaz adı başarıyla güncellendi.', { device: updatedDevice });
  } catch (error) {
    console.error('Cihaz adı güncelleme hatası:', error);
    return Response.internalServerError(res, 'Cihaz adı güncellenemedi.');
  }
};

/**
 * Mevcut cihaz hariç tüm cihazları siler
 */
const removeAllDevices = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Mevcut cihazı bul
    const currentDevice = await prisma.trustedDevice.findFirst({
      where: {
        userId,
        isCurrentDevice: true,
      },
      select: { id: true },
    });
    
    if (!currentDevice) {
      return Response.badRequest(res, 'Mevcut cihaz bulunamadı.');
    }
    
    // Mevcut cihaz hariç tüm cihazları sil
    await prisma.trustedDevice.deleteMany({
      where: {
        userId,
        NOT: {
          id: currentDevice.id,
        },
      },
    });
    
    return Response.ok(res, 'Diğer tüm cihazlar başarıyla silindi.');
  } catch (error) {
    console.error('Tüm cihazları silme hatası:', error);
    return Response.internalServerError(res, 'Cihazlar silinemedi.');
  }
};

module.exports = {
  listDevices,
  addDevice,
  removeDevice,
  updateDeviceName,
  removeAllDevices,
};