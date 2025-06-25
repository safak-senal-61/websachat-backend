// src/controllers/auth/register_controller.js

const bcrypt = require('bcryptjs');
const { PrismaClient, UserRole } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { sendWelcomeAndActivationEmail } = require('../../utils/mailer');
const { generateEmailVerificationToken } = require('./utils');
const { CLIENT_URL, ADMIN_SECRET, WIP_SECRET } = require('./constants');

/**
 * Standart kullanıcı kaydı.
 */
const register = async (req, res) => {
  const { username, email, password, nickname, invitationToken, ...otherData } = req.body;
  if (!username || !email || !password) {
    return Response.badRequest(res, 'Kullanıcı adı, e-posta ve şifre zorunludur.');
  }
  if (password.length < 8) {
    return Response.badRequest(res, 'Şifre en az 8 karakter olmalıdır.');
  }

  try {
    const existingUserByUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUserByUsername) return Response.conflict(res, 'Bu kullanıcı adı zaten alınmış.');

    const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUserByEmail) return Response.conflict(res, 'Bu e-posta adresi zaten kullanılıyor.');

    // Davet token'ını kontrol et
    let inviterId = null;
    let invitationId = null;
    let inviterUsername = null;

    if (invitationToken) {
      // Davet kontrolcüsünü import et
      const { verifyInvitation } = require('../follow/invitation_controller');
      const invitationResult = await verifyInvitation(invitationToken);
      
      if (invitationResult.valid) {
        inviterId = invitationResult.inviterId;
        invitationId = invitationResult.invitationId;
        inviterUsername = invitationResult.inviterUsername;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const birthDateObj = otherData.birthDate ? new Date(otherData.birthDate) : null;
    if (otherData.birthDate && isNaN(birthDateObj.getTime())) {
      return Response.badRequest(res, 'Geçersiz doğum tarihi formatı.');
    }

    // Prisma'ya gönderilecek veri objesini hazırla
    const data = {
      ...otherData,
      username,
      email,
      password: hashedPassword,
      nickname: nickname || username,
      birthDate: birthDateObj,
      role: UserRole.USER,
    };

    // Eğer bir davet eden varsa, ilişkiyi 'connect' ile kur.
    if (inviterId) {
      data.invitedBy = {
        connect: { id: inviterId }
      };
    }

    const newUser = await prisma.user.create({
      data: data,
    });

    const verificationToken = generateEmailVerificationToken(newUser.id, newUser.email);

    const verificationLink = `${CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendWelcomeAndActivationEmail(newUser.email, newUser.nickname || newUser.username, verificationLink);

    return Response.created(res, 'Kayıt başarılı. Hesabınızı aktive etmek için e-postanızı kontrol edin.', {
      kullanici: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    console.error('Kayıt sırasında hata:', error);
    if (error.code === 'P2002') return Response.conflict(res, 'Kullanıcı adı veya e-posta zaten mevcut.');
    return Response.internalServerError(res, 'Kayıt sırasında bir sunucu hatası oluştu.');
  }
};

/**
 * Admin kullanıcı kaydı.
 */
const registerAdmin = async (req, res) => {
  const { username, email, password, nickname, registrationSecret, ...otherData } = req.body;
  if (!ADMIN_SECRET) return Response.serviceUnavailable(res, 'Admin kaydı devre dışı.');
  if (registrationSecret !== ADMIN_SECRET) return Response.forbidden(res, 'Admin kaydı için anahtar geçersiz.');
  if (!username || !email || !password) return Response.badRequest(res, 'Kullanıcı adı, e-posta ve şifre zorunludur.');

  try {
    // --- EKSİK OLAN KONTROL BURAYA EKLENDİ ---
    const existingUserByUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUserByUsername) {
      return Response.conflict(res, 'Bu kullanıcı adı zaten alınmış.');
    }

    const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUserByEmail) {
      return Response.conflict(res, 'Bu e-posta adresi zaten kullanılıyor.');
    }
    // --- KONTROL SONU ---

    const hashedPassword = await bcrypt.hash(password, 12);
    const newAdmin = await prisma.user.create({
      data: {
        ...otherData,
        username,
        email,
        password: hashedPassword,
        nickname: nickname || username,
        role: UserRole.ADMIN,
        isEmailVerified: true, // Adminler doğrulanmış başlar
      },
    });
    return Response.created(res, 'Admin kullanıcısı başarıyla oluşturuldu.', {
        kullanici: { id: newAdmin.id, username: newAdmin.username, email: newAdmin.email, role: newAdmin.role }
    });
  } catch (error) {
    console.error('Admin kaydı sırasında hata:', error);
    // Bu catch bloğu hala bir güvenlik katmanı olarak kalabilir, ancak yukarıdaki kontroller hatayı daha erken yakalayacaktır.
    if (error.code === 'P2002') return Response.conflict(res, 'Kullanıcı adı veya e-posta zaten mevcut.');
    return Response.internalServerError(res, 'Admin kaydı sırasında bir hata oluştu.');
  }
};


/**
 * WIP kullanıcı kaydı. (Work In Progress)
 */
const registerWip = async (req, res) => {
  const { registrationSecret } = req.body;
  if (!WIP_SECRET || registrationSecret !== WIP_SECRET) {
    return Response.forbidden(res, 'WIP kaydı için yetkiniz yok veya özellik devre dışı.');
  }
  // TODO: Implement WIP registration logic similar to 'register'
  return Response.notImplemented(res, "WIP Kayıt özelliği henüz aktif değil.");
};

module.exports = {
  register,
  registerAdmin,
  registerWip,
};