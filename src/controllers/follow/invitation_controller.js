// src/controllers/follow/invitation_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { sendEmail } = require('../../utils/mailer');
const jwt = require('jsonwebtoken');

// Davet token'ı için gizli anahtar ve süre
const INVITATION_SECRET = process.env.INVITATION_SECRET || 'your-invitation-secret-key';
const INVITATION_EXPIRES_IN = process.env.INVITATION_EXPIRES_IN || '7d'; // 7 gün
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3001';

// Davet ödül miktarı (elmas)
const INVITATION_REWARD_AMOUNT = 50;

/**
 * Arkadaş davet linki oluşturur
 */
exports.createInvitationLink = async (req, res) => {
    const userId = req.user.userId;

    try {
        // Kullanıcı bilgilerini al
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, email: true }
        });

        if (!user) {
            return Response.notFound(res, 'Kullanıcı bulunamadı.');
        }

        // Davet token'ı oluştur
        const invitationToken = jwt.sign(
            { 
                inviterId: userId,
                inviterUsername: user.username,
                type: 'invitation'
            }, 
            INVITATION_SECRET, 
            { expiresIn: INVITATION_EXPIRES_IN }
        );

        // Davet linkini oluştur
        const invitationLink = `${CLIENT_URL}/register?invitation=${invitationToken}`;

        return Response.ok(res, 'Davet linki başarıyla oluşturuldu.', { 
            invitationLink,
            expiresIn: INVITATION_EXPIRES_IN
        });
    } catch (error) {
        console.error('Davet linki oluşturma hatası:', error);
        return Response.internalServerError(res, 'Davet linki oluşturulurken bir hata oluştu.');
    }
};

/**
 * Davet linkini e-posta ile gönderir
 */
exports.sendInvitationEmail = async (req, res) => {
    const userId = req.user.userId;
    const { email, message } = req.body;

    if (!email) {
        return Response.badRequest(res, 'Davet göndermek için e-posta adresi gereklidir.');
    }

    try {
        // Kullanıcı bilgilerini al
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, nickname: true, email: true }
        });

        if (!user) {
            return Response.notFound(res, 'Kullanıcı bulunamadı.');
        }

        // Davet token'ı oluştur
        const invitationToken = jwt.sign(
            { 
                inviterId: userId,
                inviterUsername: user.username,
                type: 'invitation'
            }, 
            INVITATION_SECRET, 
            { expiresIn: INVITATION_EXPIRES_IN }
        );

        // Davet linkini oluştur
        const invitationLink = `${CLIENT_URL}/register?invitation=${invitationToken}`;

        // Kişiselleştirilmiş mesaj veya varsayılan mesaj
        const personalMessage = message || `Merhaba! ${user.nickname || user.username} seni WebSaChat'e davet ediyor. Hemen kaydol ve birlikte oyun oynayalım!`;

        // E-posta gönder
        await sendEmail(
            email,
            `${user.nickname || user.username} seni WebSaChat'e davet ediyor!`,
            `<p>${personalMessage}</p><p>Kaydolmak için <a href="${invitationLink}">buraya tıkla</a>.</p><p>Bu davet linki ${INVITATION_EXPIRES_IN.replace('d', ' gün')} geçerlidir.</p>`
        );

        // Davet kaydını oluştur
        await prisma.invitation.create({
            data: {
                inviterId: userId,
                invitedEmail: email,
                token: invitationToken,
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 gün
            }
        });

        return Response.ok(res, `Davet e-postası ${email} adresine başarıyla gönderildi.`);
    } catch (error) {
        console.error('Davet e-postası gönderme hatası:', error);
        return Response.internalServerError(res, 'Davet e-postası gönderilirken bir hata oluştu.');
    }
};

/**
 * Davet token'ını doğrular ve kullanıcı kaydı sırasında kullanır
 */
exports.verifyInvitation = async (invitationToken) => {
    try {
        // Token'ı doğrula
        const decoded = jwt.verify(invitationToken, INVITATION_SECRET);
        
        if (decoded.type !== 'invitation') {
            return { valid: false, message: 'Geçersiz davet token tipi.' };
        }

        // Davet kaydını kontrol et
        const invitation = await prisma.invitation.findFirst({
            where: {
                token: invitationToken,
                status: 'PENDING',
                expiresAt: { gt: new Date() }
            }
        });

        // Davet kaydı yoksa ama token geçerliyse (e-posta ile gönderilmemiş olabilir)
        if (!invitation && decoded.inviterId) {
            return { 
                valid: true, 
                inviterId: decoded.inviterId,
                inviterUsername: decoded.inviterUsername
            };
        }

        // Davet kaydı varsa
        if (invitation) {
            return { 
                valid: true, 
                inviterId: invitation.inviterId,
                invitationId: invitation.id
            };
        }

        return { valid: false, message: 'Davet bulunamadı veya süresi dolmuş.' };
    } catch (error) {
        console.error('Davet doğrulama hatası:', error);
        return { valid: false, message: 'Davet doğrulanırken bir hata oluştu.' };
    }
};

/**
 * Davet eden kullanıcıya ödül verir
 */
exports.rewardInviter = async (inviterId, invitedUserId) => {
    try {
        // Kullanıcının elmas bakiyesini güncelle
        await prisma.user.update({
            where: { id: inviterId },
            data: {
                diamondBalance: {
                    increment: INVITATION_REWARD_AMOUNT
                }
            }
        });

        // İşlem kaydı oluştur
        await prisma.transaction.create({
            data: {
                userId: inviterId,
                type: 'INVITATION_REWARD',
                amount: INVITATION_REWARD_AMOUNT,
                currency: 'DIAMOND',
                status: 'COMPLETED',
                description: `Davet ettiğiniz kullanıcı kaydoldu ve ${INVITATION_REWARD_AMOUNT} elmas kazandınız.`,
                metadata: JSON.stringify({
                    invitedUserId: invitedUserId
                })
            }
        });

        // Davet durumunu güncelle
        await prisma.invitation.updateMany({
            where: {
                inviterId: inviterId,
                invitedUserId: invitedUserId,
                status: 'ACCEPTED'
            },
            data: {
                rewardClaimed: true,
                rewardAmount: INVITATION_REWARD_AMOUNT
            }
        });

        return true;
    } catch (error) {
        console.error('Davet ödülü verme hatası:', error);
        return false;
    }
};

/**
 * Davet token'ını doğrular ve kullanıcıya gösterir
 */
exports.verifyInvitationToken = async (req, res) => {
    const { token } = req.params;
    
    if (!token) {
        return Response.badRequest(res, 'Davet token\'ı sağlanmadı.');
    }
    
    try {
        const result = await exports.verifyInvitation(token);
        
        if (result.valid) {
            return Response.ok(res, 'Davet başarıyla doğrulandı.', {
                inviterUsername: result.inviterUsername
            });
        } else {
            return Response.badRequest(res, result.message || 'Geçersiz veya süresi dolmuş davet.');
        }
    } catch (error) {
        console.error('Davet token doğrulama hatası:', error);
        return Response.internalServerError(res, 'Davet doğrulanırken bir hata oluştu.');
    }
};

/**
 * Kullanıcının davet geçmişini listeler
 */
exports.getInvitationHistory = async (req, res) => {
    const userId = req.user.userId;

    try {
        const invitations = await prisma.invitation.findMany({
            where: { inviterId: userId },
            include: {
                invitedUser: {
                    select: {
                        id: true,
                        username: true,
                        nickname: true,
                        profilePictureUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Toplam kazanılan ödül miktarını hesapla
        const totalReward = invitations
            .filter(inv => inv.rewardClaimed)
            .reduce((sum, inv) => sum + (inv.rewardAmount || 0), 0);

        // Başarılı davet sayısı
        const successfulInvitations = invitations.filter(inv => inv.status === 'ACCEPTED').length;

        return Response.ok(res, 'Davet geçmişi başarıyla getirildi.', {
            invitations,
            stats: {
                totalInvitations: invitations.length,
                successfulInvitations,
                totalReward
            }
        });
    } catch (error) {
        console.error('Davet geçmişi getirme hatası:', error);
        return Response.internalServerError(res, 'Davet geçmişi getirilirken bir hata oluştu.');
    }
};