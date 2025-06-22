// src/controllers/follow/actions_controller.js

const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { checkBlockStatus } = require('./utils_controller');

const FOLLOW_REQUEST_STATUS = { PENDING: 'PENDING' };

const followUserOrSendRequest = async (req, res) => {
    const followerId = req.user.userId;
    const { targetUserId } = req.params;

    if (followerId === targetUserId) {
        return Response.badRequest(res, "Kendinizi takip edemezsiniz.");
    }

    try {
        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
        if (!targetUser) {
            return Response.notFound(res, "Takip edilecek kullanıcı bulunamadı.");
        }

        const { userBlockedTarget, targetBlockedUser } = await checkBlockStatus(followerId, targetUserId);
        if (userBlockedTarget || targetBlockedUser) {
            return Response.forbidden(res, "Engelleme durumu nedeniyle bu işlem gerçekleştirilemez.");
        }

        const existingFollow = await prisma.follow.findUnique({
            where: { followerId_followingId: { followerId, followingId: targetUserId } },
        });
        if (existingFollow) {
            return Response.badRequest(res, "Bu kullanıcıyı zaten takip ediyorsunuz.");
        }

        if (targetUser.isPrivate) {
            const existingRequest = await prisma.followRequest.findFirst({
                where: { requesterId: followerId, recipientId: targetUserId, status: FOLLOW_REQUEST_STATUS.PENDING },
            });
            if (existingRequest) {
                return Response.badRequest(res, "Bu kullanıcıya zaten bir takip isteği gönderdiniz.");
            }
            const followRequest = await prisma.followRequest.create({
                data: { requesterId: followerId, recipientId: targetUserId, status: FOLLOW_REQUEST_STATUS.PENDING },
            });
            return Response.created(res, "Takip isteği gönderildi.", { istek: followRequest });
        } else {
            const newFollow = await prisma.follow.create({
                data: { followerId, followingId: targetUserId },
            });
            await prisma.$transaction([
                prisma.user.update({ where: { id: followerId }, data: { followingCount: { increment: 1 } } }),
                prisma.user.update({ where: { id: targetUserId }, data: { followerCount: { increment: 1 } } }),
            ]);
            return Response.created(res, "Kullanıcı başarıyla takip edildi.", { takipDetayi: newFollow });
        }
    } catch (error) {
        console.error("[followUserOrSendRequest] Hata:", error);
        return Response.internalServerError(res, "İşlem sırasında bir hata oluştu.");
    }
};

const unfollowUser = async (req, res) => {
    const followerId = req.user.userId;
    const { targetUserId } = req.params;

    try {
        const existingFollow = await prisma.follow.findUnique({
            where: { followerId_followingId: { followerId, followingId: targetUserId } },
        });

        if (!existingFollow) {
            return Response.badRequest(res, "Bu kullanıcıyı zaten takip etmiyorsunuz.");
        }

        await prisma.$transaction([
            prisma.follow.delete({ where: { followerId_followingId: { followerId, followingId: targetUserId } } }),
            prisma.user.update({ where: { id: followerId }, data: { followingCount: { decrement: 1 } } }),
            prisma.user.update({ where: { id: targetUserId }, data: { followerCount: { decrement: 1 } } }),
        ]);
        return Response.ok(res, "Kullanıcı takipten çıkarıldı.");
    } catch (error) {
        console.error(`[unfollowUser] Hata:`, error);
        return Response.internalServerError(res, "Kullanıcı takipten çıkarılırken bir hata oluştu.");
    }
};

module.exports = {
    followUserOrSendRequest,
    unfollowUser,
};
