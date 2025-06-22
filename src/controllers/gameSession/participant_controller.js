// src/controllers/gameSession/participant_controller.js
const { PrismaClient, UserRole } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

const GAME_SESSION_STATUS = { WAITING: 'WAITING' };

// Bu helper fonksiyon bu modülde de kullanılabilir veya merkezi bir utils dosyasından import edilebilir.
const parseJsonArrayField = (fieldValue) => {
    try {
        if (typeof fieldValue === 'string') return JSON.parse(fieldValue);
        return Array.isArray(fieldValue) ? fieldValue : [];
    } catch (e) { return []; }
};

exports.joinGameSession = async (req, res) => {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    try {
        const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
        if (!session) {
            return Response.notFound(res, "Oyun oturumu bulunamadı.");
        }
        if (session.status !== GAME_SESSION_STATUS.WAITING) {
            return Response.forbidden(res, `Bu oyun oturumuna şu anda katılamazsınız.`);
        }

        let participants = parseJsonArrayField(session.participants);
        if (participants.includes(userId)) {
            return Response.ok(res, "Zaten bu oyun oturumundasınız.");
        }
        if (session.currentPlayers >= session.maxPlayers) {
            return Response.forbidden(res, "Oyun oturumu dolu.");
        }
        
        await prisma.gameSession.update({
            where: { id: sessionId },
            data: {
                participants: { push: userId },
                currentPlayers: { increment: 1 }
            }
        });

        return Response.ok(res, `Oyun oturumuna başarıyla katıldınız.`);
    } catch (error) {
        console.error(`Oyun oturumuna katılma hatası:`, error);
        return Response.internalServerError(res, "Oturuma katılırken bir hata oluştu.");
    }
};

exports.leaveGameSession = async (req, res) => {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    try {
        const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
        if (!session) return Response.ok(res, "Oturum bulunamadı veya zaten ayrıldınız.");
        
        let participants = parseJsonArrayField(session.participants);
        if (!participants.includes(userId)) {
            return Response.ok(res, "Zaten bu oyun oturumunda değilsiniz.");
        }

        const newParticipants = participants.filter(id => id !== userId);
        
        // Host ayrılırsa ve odada kimse kalmazsa oturumu iptal et
        if (session.hostId === userId && newParticipants.length === 0) {
            await prisma.gameSession.update({ where: {id: sessionId}, data: {status: 'CANCELLED', endTime: new Date(), participants: [], currentPlayers: 0}});
            return Response.ok(res, "Host olduğunuz oturumdan ayrıldınız ve oturum sonlandırıldı.");
        }

        await prisma.gameSession.update({
            where: { id: sessionId },
            data: {
                participants: newParticipants,
                currentPlayers: { decrement: 1 }
            }
        });
        
        return Response.ok(res, `Oyun oturumundan başarıyla ayrıldınız.`);
    } catch (error) {
        console.error(`Oyun oturumundan ayrılma hatası:`, error);
        return Response.internalServerError(res, "Oturumdan ayrılırken bir hata oluştu.");
    }
};

exports.kickParticipantFromSession = async (req, res) => {
    const { sessionId, targetUserId } = req.params;
    const requesterId = req.user.userId;
    const requesterRole = req.user.role;

    try {
        const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
        if (!session) return Response.notFound(res, "Oyun oturumu bulunamadı.");

        if (session.hostId !== requesterId && requesterRole !== UserRole.ADMIN) {
            return Response.forbidden(res, "Katılımcı atma yetkiniz yok.");
        }
        if (targetUserId === session.hostId) {
            return Response.badRequest(res, "Oturum sahibini atamazsınız.");
        }

        let participants = parseJsonArrayField(session.participants);
        if (!participants.includes(targetUserId)) {
            return Response.notFound(res, "Atılacak kullanıcı bu oturumda bulunmuyor.");
        }

        const newParticipants = participants.filter(id => id !== targetUserId);
        await prisma.gameSession.update({
            where: { id: sessionId },
            data: {
                participants: newParticipants,
                currentPlayers: { decrement: 1 }
            }
        });

        return Response.ok(res, `Kullanıcı oturumdan başarıyla atıldı.`);
    } catch (error) {
        console.error("Katılımcı atma hatası:", error);
        return Response.internalServerError(res, "Katılımcı atılırken bir hata oluştu.");
    }
};
