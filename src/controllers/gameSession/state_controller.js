// src/controllers/gameSession/state_controller.js
const { PrismaClient, UserRole } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

const GAME_SESSION_STATUS = { WAITING: 'WAITING', IN_PROGRESS: 'IN_PROGRESS', COMPLETED: 'COMPLETED', CANCELLED: 'CANCELLED' };

exports.updateGameSessionStatus = async (req, res) => {
    const { sessionId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (!status || !Object.values(GAME_SESSION_STATUS).includes(status.toUpperCase())) {
        return Response.badRequest(res, `Geçersiz oturum durumu.`);
    }
    const newStatus = status.toUpperCase();

    try {
        const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
        if (!session) {
            return Response.notFound(res, "Güncellenecek oyun oturumu bulunamadı.");
        }

        if (session.hostId !== userId && userRole !== UserRole.ADMIN) {
            return Response.forbidden(res, "Bu oyun oturumunun durumunu değiştirme yetkiniz yok.");
        }
        
        // Basit durum geçiş kontrolü
        if ([GAME_SESSION_STATUS.COMPLETED, GAME_SESSION_STATUS.CANCELLED].includes(session.status)) {
            return Response.badRequest(res, `Bu oturum zaten '${session.status}' durumunda, tekrar değiştirilemez.`);
        }

        const dataToUpdate = { status: newStatus };
        if (newStatus === GAME_SESSION_STATUS.IN_PROGRESS && !session.startTime) {
            dataToUpdate.startTime = new Date();
        } else if ([GAME_SESSION_STATUS.COMPLETED, GAME_SESSION_STATUS.CANCELLED].includes(newStatus) && !session.endTime) {
            dataToUpdate.endTime = new Date();
        }

        const updatedSession = await prisma.gameSession.update({
            where: { id: sessionId },
            data: dataToUpdate,
        });

        return Response.ok(res, `Oyun oturumunun durumu '${newStatus}' olarak güncellendi.`, { oturum: updatedSession });
    } catch (error) {
        console.error(`Oyun oturumu durumu güncelleme hatası:`, error);
        return Response.internalServerError(res, "Oturum durumu güncellenirken bir hata oluştu.");
    }
};
