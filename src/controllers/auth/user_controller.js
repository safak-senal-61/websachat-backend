// src/controllers/auth/user.controller.js

const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { sanitizeUser } = require('./utils');

/**
 * Middleware tarafından kimliği doğrulanan kullanıcının bilgilerini getirir.
 * `req.user` nesnesinin authentication middleware tarafından eklendiği varsayılır.
 */
const getMe = async (req, res) => {
  if (!req.user || !req.user.userId) {
    return Response.unauthorized(res, "Kimlik doğrulama başarısız.");
  }

  const userId = req.user.userId;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return Response.notFound(res, "Kullanıcı hesabı bulunamadı.");
    }
    return Response.ok(res, "Kullanıcı bilgileri başarıyla alındı.", { kullanici: sanitizeUser(user) });
  } catch (error) {
    console.error(`Kullanıcı bilgileri getirme hatası (UserID: ${userId}):`, error);
    return Response.internalServerError(res, "Kullanıcı bilgileriniz alınırken bir hata oluştu.");
  }
};

module.exports = {
  getMe,
};
