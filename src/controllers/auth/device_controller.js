const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const geoip = require('geoip-lite');
const jwt = require('jsonwebtoken');

/**
 * Yeni bir güvenilir cihaz ekler. IP, User-Agent ve coğrafi konum bilgilerini backend'de işler.
 */
const addDevice = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { deviceName, deviceType, location: frontendLocation, userAgent: frontendUserAgent } = req.body;

    if (!deviceName) {
      return Response.badRequest(res, 'Cihaz adı gereklidir.');
    }

    // IP adresini al (proxy'ler için X-Forwarded-For header'ını da kontrol et)
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                     req.ip;

    // User-Agent bilgisini al (frontend'den gelen varsa onu kullan, yoksa header'dan al)
    const userAgent = frontendUserAgent || req.headers['user-agent'] || 'Unknown';
    
    // Konum bilgisini belirle
    let location = 'Bilinmeyen Konum';
    
    // Önce frontend'den gelen konum bilgisini kontrol et
    if (frontendLocation && frontendLocation !== 'Bilinmeyen Konum') {
      location = frontendLocation;
      console.log('Konum bilgisi frontend\'den alındı:', location);
    } else {
      // Backend'de IP'den konum bilgisini çıkar
      try {
        // IPv6 mapped IPv4 adreslerini temizle
        let cleanIP = ipAddress;
        if (ipAddress && ipAddress.startsWith('::ffff:')) {
          cleanIP = ipAddress.substring(7);
        }
        
        const geo = geoip.lookup(cleanIP);
        if (geo) {
          location = geo.city ? `${geo.city}, ${geo.country}` : geo.country;
          console.log('Konum bilgisi backend\'de IP\'den alındı:', location, 'IP:', cleanIP);
        } else {
          console.log('IP adresinden konum bilgisi alınamadı:', cleanIP);
        }
      } catch (error) {
        console.error('IP konum çözümleme hatası:', error);
      }
    }

    // Aynı cihazın zaten kayıtlı olup olmadığını kontrol et
    const existingDevice = await prisma.trustedDevice.findFirst({
      where: {
        userId,
        OR: [
          { userAgent },
          { 
            AND: [
              { deviceName },
              { deviceType: deviceType || 'other' }
            ]
          }
        ]
      }
    });

    if (existingDevice) {
      // Mevcut cihazı güncelle
      const updatedDevice = await prisma.trustedDevice.update({
        where: { id: existingDevice.id },
        data: {
          ipAddress,
          location,
          lastUsedAt: new Date(),
          isCurrentDevice: true
        }
      });
      
      // Diğer cihazların 'isCurrentDevice' flag'ini kaldır
      await prisma.trustedDevice.updateMany({
        where: { 
          userId: userId,
          id: { not: existingDevice.id }
        },
        data: { isCurrentDevice: false }
      });
      
      return Response.ok(res, 'Mevcut cihaz güncellendi.', { device: updatedDevice });
    }

    // Mevcut diğer cihazların 'isCurrentDevice' flag'ini kaldır
    await prisma.trustedDevice.updateMany({
      where: { userId: userId },
      data: { isCurrentDevice: false }
    });

    // Yeni cihazı veritabanına ekle
    const device = await prisma.trustedDevice.create({
      data: {
        userId,
        deviceName,
        deviceType: deviceType || 'other',
        ipAddress,
        userAgent,
        location,
        isCurrentDevice: true,
      },
    });

    console.log('Yeni cihaz eklendi:', {
      deviceName,
      deviceType: deviceType || 'other',
      ipAddress,
      location,
      userAgent: userAgent.substring(0, 50) + '...'
    });

    return Response.created(res, 'Güvenilir cihaz başarıyla eklendi.', { device });
  } catch (error) {
    console.error('Cihaz ekleme hatası:', error);
    return Response.internalServerError(res, 'Cihaz eklenemedi.');
  }
};

/**
 * Kullanıcının güvenilir cihazlarını listeler
 */
const listDevices = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const devices = await prisma.trustedDevice.findMany({
      where: { userId },
      select: {
        id: true,
        deviceName: true,
        deviceType: true,
        ipAddress: true,
        location: true,
        lastUsedAt: true,
        createdAt: true,
        isCurrentDevice: true,
        userAgent: true,
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
 * Güvenilir cihazı siler ve o cihazdan oturum sonlandırır
 */
const removeDevice = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { deviceId } = req.params;
    
    if (!deviceId) {
      return Response.badRequest(res, 'Cihaz ID gereklidir.');
    }
    
    const device = await prisma.trustedDevice.findFirst({
      where: { id: deviceId, userId: userId },
    });
    
    if (!device) {
      return Response.forbidden(res, 'Bu cihazı silme yetkiniz yok veya cihaz bulunamadı.');
    }
    
    if (device.isCurrentDevice) {
      return Response.badRequest(res, 'Şu anda kullandığınız aktif oturum cihazını silemezsiniz.');
    }
    
    // Cihazı sil
    await prisma.trustedDevice.delete({
      where: { id: deviceId },
    });
    
    // O cihazdan gelen tüm aktif oturumları sonlandır
    // Bu işlem için refresh token'ları da silebiliriz
    try {
      await prisma.refreshToken.deleteMany({
        where: {
          userId: userId,
          // Eğer refresh token tablosunda device bilgisi varsa
          // deviceId: deviceId veya userAgent: device.userAgent
        }
      });
      console.log(`Cihaz silindi ve oturumlar sonlandırıldı: ${device.deviceName}`);
    } catch (tokenError) {
      console.error('Oturum sonlandırma hatası:', tokenError);
      // Cihaz silinmiş olsa bile devam et
    }
    
    return Response.ok(res, 'Güvenilir cihaz başarıyla silindi ve oturumlar sonlandırıldı.');
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
    
    const device = await prisma.trustedDevice.findFirst({
      where: { id: deviceId, userId: userId },
    });
    
    if (!device) {
      return Response.forbidden(res, 'Bu cihazı güncelleme yetkiniz yok veya cihaz bulunamadı.');
    }
    
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
 * Mevcut cihaz hariç tüm cihazları siler ve oturumları sonlandırır
 */
const removeAllDevices = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Silinecek cihazları al
    const devicesToDelete = await prisma.trustedDevice.findMany({
      where: {
        userId,
        isCurrentDevice: false,
      },
      select: { id: true, deviceName: true, userAgent: true }
    });
    
    // Cihazları sil
    const deleteResult = await prisma.trustedDevice.deleteMany({
      where: {
        userId,
        isCurrentDevice: false,
      },
    });
    
    // Silinen cihazlardan gelen tüm aktif oturumları sonlandır
    try {
      await prisma.refreshToken.deleteMany({
        where: {
          userId: userId,
          // Eğer refresh token tablosunda device bilgisi varsa
          // deviceId: { in: devicesToDelete.map(d => d.id) }
        }
      });
      console.log(`${deleteResult.count} cihaz silindi ve oturumlar sonlandırıldı`);
    } catch (tokenError) {
      console.error('Toplu oturum sonlandırma hatası:', tokenError);
    }
    
    return Response.ok(res, `${deleteResult.count} cihaz başarıyla silindi ve oturumlar sonlandırıldı.`);
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