// src/controllers/auth/session_controller.js

const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { ExpressAuth } = require('@auth/express');
const authConfig = require('./authjs_config');

/**
 * Kullanıcının aktif oturumlarını listeler
 */
const listSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Auth.js oturumlarını getir
    const auth = await ExpressAuth(req, res, authConfig);
    const currentSession = await auth.getSession();
    
    // Veritabanından tüm oturumları getir
    const sessions = await prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        expires: true,
        sessionToken: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    
    // Mevcut oturumu işaretle
    const sanitizedSessions = sessions.map(session => {
      const isCurrentSession = currentSession && session.sessionToken === currentSession.sessionToken;
      // eslint-disable-next-line no-unused-vars
      const { sessionToken, ...rest } = session;
      return { ...rest, isCurrentSession };
    });
    
    return Response.ok(res, 'Aktif oturumlar başarıyla getirildi.', { sessions: sanitizedSessions });
  } catch (error) {
    console.error('Oturumları getirirken hata:', error);
    return Response.internalServerError(res, 'Oturumlar getirilemedi.');
  }
};

/**
 * Belirli bir oturumu sonlandırır
 */
const terminateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;
    
    if (!sessionId) {
      return Response.badRequest(res, 'Oturum ID gereklidir.');
    }
    
    // Oturumun kullanıcıya ait olup olmadığını kontrol et
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });
    
    if (!session || session.userId !== userId) {
      return Response.forbidden(res, 'Bu oturumu sonlandırma yetkiniz yok.');
    }
    
    // Oturumu sil
    await prisma.session.delete({
      where: { id: sessionId },
    });
    
    return Response.ok(res, 'Oturum başarıyla sonlandırıldı.');
  } catch (error) {
    console.error('Oturumu sonlandırırken hata:', error);
    return Response.internalServerError(res, 'Oturum sonlandırılamadı.');
  }
};

/**
 * Mevcut oturum hariç tüm oturumları sonlandırır
 */
const terminateAllSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Mevcut oturumu bul
    const auth = await ExpressAuth(req, res, authConfig);
    const currentSession = await auth.getSession();
    
    if (!currentSession) {
      return Response.unauthorized(res, 'Mevcut oturum bulunamadı.');
    }
    
    // Mevcut oturum hariç tüm oturumları sil
    await prisma.session.deleteMany({
      where: {
        userId,
        NOT: {
          sessionToken: currentSession.sessionToken,
        },
      },
    });
    
    return Response.ok(res, 'Diğer tüm cihazlardaki oturumlar başarıyla sonlandırıldı.');
  } catch (error) {
    console.error('Tüm oturumları sonlandırırken hata:', error);
    return Response.internalServerError(res, 'Oturumlar sonlandırılamadı.');
  }
};

/**
 * Oturum detaylarını getirir
 */
const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;
    
    if (!sessionId) {
      return Response.badRequest(res, 'Oturum ID gereklidir.');
    }
    
    // Oturumun kullanıcıya ait olup olmadığını kontrol et
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        expires: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });
    
    if (!session || session.userId !== userId) {
      return Response.forbidden(res, 'Bu oturum bilgilerine erişim yetkiniz yok.');
    }
    
    return Response.ok(res, 'Oturum detayları başarıyla getirildi.', { session });
  } catch (error) {
    console.error('Oturum detaylarını getirirken hata:', error);
    return Response.internalServerError(res, 'Oturum detayları getirilemedi.');
  }
};

module.exports = {
  listSessions,
  terminateSession,
  terminateAllSessions,
  getSessionDetails,
};