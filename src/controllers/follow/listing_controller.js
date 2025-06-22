// src/controllers/follow/listing_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { parseJsonArrayField } = require('./utils_controller');

const listFollowers = async (req, res) => {
    const currentUserId = req.user.userId;
    const { userId: targetUserId } = req.params;
    // ... (Gizlilik ve engelleme kontrolleri orijinal koddaki gibi eklenebilir)
    try {
        const followerRelations = await prisma.follow.findMany({
            where: { followingId: targetUserId },
            include: { follower: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } } },
            orderBy: { createdAt: 'desc' },
        });
        const followers = followerRelations.map(rel => rel.follower);
        return Response.ok(res, `Takipçiler listelendi.`, { kullanicilar: followers });
    } catch (error) {
        console.error(`[listFollowers] Hata:`, error);
        return Response.internalServerError(res, "Takipçiler listelenirken bir hata oluştu.");
    }
};

const listFollowing = async (req, res) => {
    const currentUserId = req.user.userId;
    const { userId: targetUserId } = req.params;
    // ... (Gizlilik ve engelleme kontrolleri orijinal koddaki gibi eklenebilir)
    try {
        const followingRelations = await prisma.follow.findMany({
            where: { followerId: targetUserId },
            include: { following: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } } },
            orderBy: { createdAt: 'desc' },
        });
        const following = followingRelations.map(rel => rel.following);
        return Response.ok(res, `Takip edilenler listelendi.`, { kullanicilar: following });
    } catch (error) {
        console.error(`[listFollowing] Hata:`, error);
        return Response.internalServerError(res, "Takip edilenler listelenirken bir hata oluştu.");
    }
};

const checkFollowStatus = async (req, res) => {
    const followerId = req.user.userId;
    const { targetUserId } = req.params;
    try {
        const isFollowing = await prisma.follow.findUnique({
            where: { followerId_followingId: { followerId, followingId: targetUserId } },
        });
        // ... (İstek durumu kontrolü orijinal koddaki gibi eklenebilir)
        return Response.ok(res, "Takip durumu kontrol edildi.", { takipEdiyor: !!isFollowing });
    } catch (error) {
        console.error("[checkFollowStatus] Hata:", error);
        return Response.internalServerError(res, "Takip durumu kontrol edilirken bir hata oluştu.");
    }
};

module.exports = {
    listFollowers,
    listFollowing,
    checkFollowStatus,
};
