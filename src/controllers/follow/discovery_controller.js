// src/controllers/follow/discovery_controller.js

const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

const searchUsers = async (req, res) => {
    const { searchTerm } = req.query;
    if (!searchTerm) {
        return Response.badRequest(res, "Arama terimi gereklidir.");
    }
    try {
        // HATA DÜZELTMESİ: 'mode: "insensitive"' argümanı kaldırıldı.
        // Bu, aramanın artık büyük/küçük harfe duyarlı olacağı anlamına gelir.
        // Eğer büyük/küçük harf duyarsız arama kritik ise, veritabanı seviyesinde
        // collation ayarlarını (örn: utf8mb4_general_ci) kontrol etmeniz gerekebilir.
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: searchTerm } },
                    { nickname: { contains: searchTerm } },
                ],
            },
            select: { id: true, username: true, nickname: true, profilePictureUrl: true },
        });
        return Response.ok(res, "Arama sonuçları getirildi.", { kullanicilar: users });
    } catch (error) {
        console.error(`[searchUsers] Hata:`, error);
        return Response.internalServerError(res, "Kullanıcı aranırken bir hata oluştu.");
    }
};

const getFollowSuggestions = async (req, res) => {
    try {
        const suggestions = await prisma.user.findMany({
            where: { isPrivate: false },
            take: 10,
            orderBy: { followerCount: 'desc' },
            select: { id: true, username: true, nickname: true, profilePictureUrl: true, bio: true },
        });
        return Response.ok(res, "Takip önerileri getirildi.", { oneriler: suggestions });
    } catch (error) {
        console.error("[getFollowSuggestions] Hata:", error);
        return Response.internalServerError(res, "Takip önerileri getirilirken bir hata oluştu.");
    }
};

const getUserProfileByUsername = async (req, res) => {
    const { username } = req.params;
    const currentUserId = req.user.userId;
    try {
        const targetUser = await prisma.user.findUnique({
            where: { username: username },
            select: {
                id: true, username: true, nickname: true, profilePictureUrl: true, bio: true,
                isPrivate: true, followerCount: true, followingCount: true,
            }
        });
        if (!targetUser) {
            return Response.notFound(res, "Kullanıcı bulunamadı.");
        }
        // ... (Engelleme ve takip durumu mantığı eklenebilir)
        return Response.ok(res, "Profil bilgileri getirildi.", targetUser);
    } catch (error) {
        console.error(`[getUserProfileByUsername] Hata:`, error);
        return Response.internalServerError(res, "Profil bilgileri getirilirken bir hata oluştu.");
    }
};

module.exports = {
    searchUsers,
    getFollowSuggestions,
    getUserProfileByUsername,
};
