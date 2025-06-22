// src/controllers/follow/blocking_controller.js

const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { parseJsonArrayField } = require('./utils_controller');

const blockUser = async (req, res) => {
    const blockerId = req.user.userId;
    const { targetUserId } = req.params;

    if (blockerId === targetUserId) {
        return Response.badRequest(res, "Kendinizi engelleyemezsiniz.");
    }

    try {
        // ... (Orijinal koddaki detaylı transaction mantığı buraya eklenebilir)
        const blocker = await prisma.user.findUnique({where: {id: blockerId}, select: {blockedUserIds: true}});
        let blockedIds = parseJsonArrayField(blocker?.blockedUserIds);
        if (blockedIds.includes(targetUserId)) {
            return Response.badRequest(res, `Bu kullanıcı zaten engellenmiş.`);
        }
        blockedIds.push(targetUserId);

        await prisma.user.update({
            where: { id: blockerId },
            data: { blockedUserIds: blockedIds }
        });
        
        return Response.ok(res, `Kullanıcı başarıyla engellendi.`);
    } catch (error) {
        console.error("[blockUser] Hata:", error);
        return Response.internalServerError(res, "Kullanıcı engellenirken bir hata oluştu.");
    }
};

const unblockUser = async (req, res) => {
    const blockerId = req.user.userId;
    const { targetUserId } = req.params;

    try {
        const blocker = await prisma.user.findUnique({where: {id: blockerId}, select: {blockedUserIds: true}});
        let blockedIds = parseJsonArrayField(blocker?.blockedUserIds);
        if (!blockedIds.includes(targetUserId)) {
            return Response.badRequest(res, 'Bu kullanıcı zaten engellenmemiş.');
        }
        const newBlockedIds = blockedIds.filter(id => id !== targetUserId);

        await prisma.user.update({
            where: { id: blockerId },
            data: { blockedUserIds: newBlockedIds }
        });
        return Response.ok(res, 'Kullanıcının engeli kaldırıldı.');
    } catch (error) {
        console.error("[unblockUser] Hata:", error);
        return Response.internalServerError(res, "Kullanıcı engeli kaldırılırken bir hata oluştu.");
    }
};

const getBlockedUsers = async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await prisma.user.findUnique({where: {id: userId}, select: {blockedUserIds: true}});
        const blockedIds = parseJsonArrayField(user?.blockedUserIds);

        const blockedUsersDetails = await prisma.user.findMany({
            where: { id: { in: blockedIds }},
            select: { id: true, username: true, nickname: true, profilePictureUrl: true },
        });
        return Response.ok(res, "Engellenen kullanıcılar listelendi.", { kullanicilar: blockedUsersDetails });
    } catch (error) {
        console.error("[getBlockedUsers] Hata:", error);
        return Response.internalServerError(res, "Engellenen kullanıcılar listelenirken bir hata oluştu.");
    }
};

module.exports = {
    blockUser,
    unblockUser,
    getBlockedUsers,
};
