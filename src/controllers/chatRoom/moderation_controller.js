// src/controllers/chatRoom/moderation.controller.js

const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { parseJsonArrayField } = require('./utils.js');

const addModerator = async (req, res) => {
    const { roomId, targetUserId } = req.params;
    const requesterId = req.user.userId;

    try {
        const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
        if (!room) return Response.notFound(res, 'Oda bulunamadı.');
        if (room.ownerId !== requesterId) {
            return Response.forbidden(res, 'Sadece oda sahibi moderatör ekleyebilir.');
        }
        
        let moderators = parseJsonArrayField(room.moderators);
        if (moderators.includes(targetUserId)) {
            return Response.badRequest(res, 'Bu kullanıcı zaten moderatör.');
        }
        
        await prisma.chatRoom.update({
            where: { id: roomId },
            data: { moderators: { push: targetUserId } }
        });
        return Response.ok(res, 'Kullanıcı başarıyla moderatör olarak eklendi.');
    } catch (error) {
        console.error("Moderatör ekleme hatası:", error);
        return Response.internalServerError(res, 'Moderatör eklenirken bir hata oluştu.');
    }
};

const removeModerator = async (req, res) => {
    const { roomId, targetUserId } = req.params;
    const requesterId = req.user.userId;

    try {
        const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
        if (!room) return Response.notFound(res, 'Oda bulunamadı.');
        if (room.ownerId !== requesterId) {
            return Response.forbidden(res, 'Sadece oda sahibi moderatör çıkarabilir.');
        }
        if (targetUserId === room.ownerId) {
            return Response.badRequest(res, "Oda sahibi moderatörlükten çıkarılamaz.");
        }

        let moderators = parseJsonArrayField(room.moderators);
        const newModerators = moderators.filter(id => id !== targetUserId);
        
        await prisma.chatRoom.update({
            where: { id: roomId },
            data: { moderators: newModerators }
        });
        return Response.ok(res, 'Kullanıcı moderatörlükten başarıyla çıkarıldı.');
    } catch (error) {
        console.error("Moderatör çıkarma hatası:", error);
        return Response.internalServerError(res, 'Moderatör çıkarılırken bir hata oluştu.');
    }
};

module.exports = {
    addModerator,
    removeModerator,
};
