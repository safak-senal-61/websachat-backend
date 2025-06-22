// src/controllers/follow/requests_controller.js

const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

const FOLLOW_REQUEST_STATUS = { PENDING: 'PENDING', ACCEPTED: 'ACCEPTED', REJECTED: 'REJECTED' };

const getPendingFollowRequests = async (req, res) => {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
        const requests = await prisma.followRequest.findMany({
            where: { recipientId: userId, status: FOLLOW_REQUEST_STATUS.PENDING },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit),
            include: { requester: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } } }
        });
        const totalRequests = await prisma.followRequest.count({
            where: { recipientId: userId, status: FOLLOW_REQUEST_STATUS.PENDING }
        });
        return Response.ok(res, "Bekleyen takip istekleri listelendi.", {
            istekler: requests,
            meta: { toplamKayit: totalRequests, suankiSayfa: parseInt(page), toplamSayfa: Math.ceil(totalRequests / limit) }
        });
    } catch (error) {
        console.error("[getPendingFollowRequests] Hata:", error);
        return Response.internalServerError(res, "İstekler listelenirken bir hata oluştu.");
    }
};

const respondToFollowRequest = async (req, res) => {
    const { requestId } = req.params;
    const { action } = req.body; // "accept" veya "reject"
    const userId = req.user.userId;

    if (!['accept', 'reject'].includes(action)) {
        return Response.badRequest(res, "Geçersiz işlem.");
    }

    try {
        const request = await prisma.followRequest.findUnique({ where: { id: requestId } });
        if (!request || request.recipientId !== userId || request.status !== FOLLOW_REQUEST_STATUS.PENDING) {
            return Response.notFound(res, "Yanıtlanacak uygun bir takip isteği bulunamadı.");
        }

        if (action === 'accept') {
            await prisma.$transaction(async (tx) => {
                await tx.follow.create({
                    data: { followerId: request.requesterId, followingId: request.recipientId }
                });
                await tx.user.update({ where: { id: request.requesterId }, data: { followingCount: { increment: 1 } } });
                await tx.user.update({ where: { id: request.recipientId }, data: { followerCount: { increment: 1 } } });
                await tx.followRequest.update({
                    where: { id: requestId },
                    data: { status: FOLLOW_REQUEST_STATUS.ACCEPTED }
                });
            });
            return Response.ok(res, "Takip isteği kabul edildi.");
        } else { // 'reject'
            await prisma.followRequest.update({
                where: { id: requestId },
                data: { status: FOLLOW_REQUEST_STATUS.REJECTED }
            });
            return Response.ok(res, "Takip isteği reddedildi.");
        }
    } catch (error) {
        console.error("[respondToFollowRequest] Hata:", error);
        return Response.internalServerError(res, "Takip isteği yanıtlanırken bir hata oluştu.");
    }
};

const cancelFollowRequest = async (req, res) => {
    const requesterId = req.user.userId;
    const { targetUserId } = req.params;

    try {
        const { count } = await prisma.followRequest.deleteMany({
            where: {
                requesterId: requesterId,
                recipientId: targetUserId,
                status: FOLLOW_REQUEST_STATUS.PENDING
            }
        });

        if (count === 0) {
            return Response.notFound(res, "İptal edilecek aktif bir takip isteği bulunamadı.");
        }
        return Response.ok(res, "Takip isteği iptal edildi.");
    } catch (error) {
        console.error("[cancelFollowRequest] Hata:", error);
        return Response.internalServerError(res, "Takip isteği iptal edilirken bir hata oluştu.");
    }
};

module.exports = {
    getPendingFollowRequests,
    respondToFollowRequest,
    cancelFollowRequest,
};
