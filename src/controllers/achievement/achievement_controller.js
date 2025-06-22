// src/controllers/achievement/achievement_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

/**
 * Tüm başarıları listeler
 */
exports.listAchievements = async (req, res) => {
    const { category, gameId } = req.query;

    try {
        const whereConditions = {};
        if (category) whereConditions.category = category.toUpperCase();
        if (gameId) whereConditions.gameId = gameId;

        const achievements = await prisma.achievement.findMany({
            where: whereConditions,
            orderBy: { requiredValue: 'asc' },
            include: {
                game: gameId ? true : false
            }
        });

        return Response.ok(res, 'Başarılar listelendi.', { basarilar: achievements });
    } catch (error) {
        console.error('Başarıları listeleme hatası:', error);
        return Response.internalServerError(res, 'Başarılar listelenirken bir hata oluştu.');
    }
};

/**
 * Başarı detaylarını getirir
 */
exports.getAchievementById = async (req, res) => {
    const { achievementId } = req.params;

    try {
        const achievement = await prisma.achievement.findUnique({
            where: { id: achievementId },
            include: {
                game: true
            }
        });

        if (!achievement) {
            return Response.notFound(res, 'Başarı bulunamadı.');
        }

        return Response.ok(res, 'Başarı detayları getirildi.', { basari: achievement });
    } catch (error) {
        console.error(`Başarı getirme hatası (ID: ${achievementId}):`, error);
        return Response.internalServerError(res, 'Başarı detayları getirilirken bir hata oluştu.');
    }
};

/**
 * Yeni başarı oluşturur (Admin veya Moderatör için)
 */
exports.createAchievement = async (req, res) => {
    const { name, description, category, type, requiredValue, iconUrl, rewardType, rewardAmount, gameId } = req.body;

    // Yetki kontrolü middleware ile yapılacak (checkRole(['ADMIN', 'MODERATOR']))

    try {
        // Gerekli alanları kontrol et
        if (!name || !description || !category || !type || !requiredValue) {
            return Response.badRequest(res, 'Başarı oluşturmak için gerekli alanları doldurunuz.');
        }

        // Oyun ID'si varsa oyunun var olup olmadığını kontrol et
        if (gameId) {
            const game = await prisma.game.findUnique({ where: { id: gameId } });
            if (!game) {
                return Response.notFound(res, 'Belirtilen oyun bulunamadı.');
            }
        }

        // Başarıyı oluştur
        const newAchievement = await prisma.achievement.create({
            data: {
                name,
                description,
                category,
                type,
                requiredValue: parseInt(requiredValue),
                iconUrl,
                rewardType,
                rewardAmount: rewardAmount ? BigInt(rewardAmount) : null,
                gameId
            },
            include: {
                game: gameId ? true : false
            }
        });

        return Response.created(res, 'Başarı başarıyla oluşturuldu.', { basari: newAchievement });
    } catch (error) {
        console.error('Başarı oluşturma hatası:', error);
        return Response.internalServerError(res, 'Başarı oluşturulurken bir hata oluştu.');
    }
};

/**
 * Başarıyı günceller (Admin veya Moderatör için)
 */
exports.updateAchievement = async (req, res) => {
    const { achievementId } = req.params;
    const { name, description, category, type, requiredValue, iconUrl, rewardType, rewardAmount, gameId } = req.body;

    // Yetki kontrolü middleware ile yapılacak (checkRole(['ADMIN', 'MODERATOR']))

    try {
        // Başarının var olup olmadığını kontrol et
        const achievement = await prisma.achievement.findUnique({
            where: { id: achievementId }
        });

        if (!achievement) {
            return Response.notFound(res, 'Başarı bulunamadı.');
        }

        // Oyun ID'si varsa oyunun var olup olmadığını kontrol et
        if (gameId) {
            const game = await prisma.game.findUnique({ where: { id: gameId } });
            if (!game) {
                return Response.notFound(res, 'Belirtilen oyun bulunamadı.');
            }
        }

        // Güncellenecek verileri hazırla
        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (category) updateData.category = category;
        if (type) updateData.type = type;
        if (requiredValue) updateData.requiredValue = parseInt(requiredValue);
        if (iconUrl) updateData.iconUrl = iconUrl;
        if (rewardType) updateData.rewardType = rewardType;
        if (rewardAmount) updateData.rewardAmount = BigInt(rewardAmount);
        if (gameId !== undefined) updateData.gameId = gameId;

        // Başarıyı güncelle
        const updatedAchievement = await prisma.achievement.update({
            where: { id: achievementId },
            data: updateData,
            include: {
                game: gameId ? true : false
            }
        });

        return Response.ok(res, 'Başarı başarıyla güncellendi.', { basari: updatedAchievement });
    } catch (error) {
        console.error(`Başarı güncelleme hatası (ID: ${achievementId}):`, error);
        return Response.internalServerError(res, 'Başarı güncellenirken bir hata oluştu.');
    }
};

/**
 * Başarıyı siler (Admin veya Moderatör için)
 */
exports.deleteAchievement = async (req, res) => {
    const { achievementId } = req.params;

    // Yetki kontrolü middleware ile yapılacak (checkRole(['ADMIN', 'MODERATOR']))

    try {
        // Başarının var olup olmadığını kontrol et
        const achievement = await prisma.achievement.findUnique({
            where: { id: achievementId }
        });

        if (!achievement) {
            return Response.notFound(res, 'Başarı bulunamadı.');
        }

        // Başarıyı sil
        await prisma.achievement.delete({
            where: { id: achievementId }
        });

        return Response.ok(res, 'Başarı başarıyla silindi.');
    } catch (error) {
        console.error(`Başarı silme hatası (ID: ${achievementId}):`, error);
        return Response.internalServerError(res, 'Başarı silinirken bir hata oluştu.');
    }
};

/**
 * Kullanıcının başarılarını kontrol eder ve gerekirse yeni başarılar kazandırır
 * Bu fonksiyon diğer controller'lardan çağrılabilir (örn: oyun oynandığında, turnuva kazanıldığında, vb.)
 */
exports.checkUserAchievements = async (userId, type, value, gameId = null) => {
    try {
        // İlgili başarıları bul
        const whereConditions = {
            type,
            requiredValue: { lte: value }
        };
        if (gameId) whereConditions.gameId = gameId;

        const eligibleAchievements = await prisma.achievement.findMany({
            where: whereConditions
        });

        if (eligibleAchievements.length === 0) return;

        // Kullanıcının zaten kazandığı başarıları bul
        const userAchievements = await prisma.userAchievement.findMany({
            where: {
                userId,
                achievementId: { in: eligibleAchievements.map(a => a.id) }
            }
        });

        const earnedAchievementIds = userAchievements.map(ua => ua.achievementId);

        // Henüz kazanılmamış başarıları belirle
        const newAchievements = eligibleAchievements.filter(a => !earnedAchievementIds.includes(a.id));

        if (newAchievements.length === 0) return;

        // Yeni başarıları kullanıcıya ekle
        const userAchievementData = newAchievements.map(achievement => ({
            userId,
            achievementId: achievement.id,
            earnedAt: new Date()
        }));

        await prisma.userAchievement.createMany({
            data: userAchievementData
        });

        // Ödülleri ver
        for (const achievement of newAchievements) {
            if (achievement.rewardType && achievement.rewardAmount) {
                if (achievement.rewardType === 'COIN') {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { coins: { increment: achievement.rewardAmount } }
                    });
                } else if (achievement.rewardType === 'DIAMOND') {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { diamonds: { increment: achievement.rewardAmount } }
                    });
                }

                // İşlem kaydı oluştur
                await prisma.transaction.create({
                    data: {
                        userId,
                        transactionType: 'ACHIEVEMENT_REWARD',
                        amount: achievement.rewardAmount,
                        currency: achievement.rewardType,
                        relatedEntityId: achievement.id,
                        relatedEntityType: 'ACHIEVEMENT',
                        status: 'COMPLETED'
                    }
                });
            }

            // Bildirim gönder
            // TODO: Bildirim gönderme işlemi
        }

        return newAchievements;
    } catch (error) {
        console.error(`Kullanıcı başarıları kontrol hatası (UserID: ${userId}):`, error);
        return null;
    }
};

/**
 * Kullanıcının başarılarını listeler
 */
exports.getUserAchievements = async (req, res) => {
    const { userId } = req.params;
    const { category, gameId } = req.query;

    try {
        // Kullanıcının var olup olmadığını kontrol et
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return Response.notFound(res, 'Kullanıcı bulunamadı.');
        }

        // Filtreleme koşullarını oluştur
        const whereConditions = { userId };
        if (category || gameId) {
            whereConditions.achievement = {};
            if (category) whereConditions.achievement.category = category.toUpperCase();
            if (gameId) whereConditions.achievement.gameId = gameId;
        }

        // Kullanıcının başarılarını getir
        const userAchievements = await prisma.userAchievement.findMany({
            where: whereConditions,
            orderBy: { earnedAt: 'desc' },
            include: {
                achievement: {
                    include: {
                        game: gameId ? true : false
                    }
                }
            }
        });

        return Response.ok(res, 'Kullanıcı başarıları listelendi.', { basarilar: userAchievements });
    } catch (error) {
        console.error(`Kullanıcı başarıları listeleme hatası (UserID: ${userId}):`, error);
        return Response.internalServerError(res, 'Kullanıcı başarıları listelenirken bir hata oluştu.');
    }
};

/**
 * Kullanıcının kendi başarılarını listeler
 */
exports.getMyAchievements = async (req, res) => {
    const userId = req.user.userId;
    const { category, gameId } = req.query;

    try {
        // Filtreleme koşullarını oluştur
        const whereConditions = { userId };
        if (category || gameId) {
            whereConditions.achievement = {};
            if (category) whereConditions.achievement.category = category.toUpperCase();
            if (gameId) whereConditions.achievement.gameId = gameId;
        }

        // Kullanıcının başarılarını getir
        const userAchievements = await prisma.userAchievement.findMany({
            where: whereConditions,
            orderBy: { earnedAt: 'desc' },
            include: {
                achievement: {
                    include: {
                        game: gameId ? true : false
                    }
                }
            }
        });

        return Response.ok(res, 'Başarılarınız listelendi.', { basarilar: userAchievements });
    } catch (error) {
        console.error(`Kullanıcı başarıları listeleme hatası (UserID: ${userId}):`, error);
        return Response.internalServerError(res, 'Başarılarınız listelenirken bir hata oluştu.');
    }
};

/**
 * Kullanıcının ilerleme durumunu getirir
 */
exports.getUserProgress = async (req, res) => {
    const userId = req.user.userId;
    const { gameId } = req.query;

    try {
        // Tüm başarıları getir
        const whereConditions = {};
        if (gameId) whereConditions.gameId = gameId;

        const allAchievements = await prisma.achievement.findMany({
            where: whereConditions,
            select: {
                id: true,
                category: true,
                gameId: true
            }
        });

        // Kullanıcının kazandığı başarıları getir
        const userAchievements = await prisma.userAchievement.findMany({
            where: {
                userId,
                achievementId: { in: allAchievements.map(a => a.id) }
            },
            select: {
                achievementId: true
            }
        });

        const earnedAchievementIds = userAchievements.map(ua => ua.achievementId);

        // Kategori bazında ilerleme durumunu hesapla
        const categories = [...new Set(allAchievements.map(a => a.category))];
        const progress = {};

        categories.forEach(category => {
            const categoryAchievements = allAchievements.filter(a => a.category === category);
            const earnedInCategory = categoryAchievements.filter(a => earnedAchievementIds.includes(a.id)).length;
            const totalInCategory = categoryAchievements.length;

            progress[category] = {
                earned: earnedInCategory,
                total: totalInCategory,
                percentage: totalInCategory > 0 ? Math.round((earnedInCategory / totalInCategory) * 100) : 0
            };
        });

        // Oyun bazında ilerleme durumunu hesapla (eğer gameId belirtilmemişse)
        const gameProgress = {};
        if (!gameId) {
            const games = [...new Set(allAchievements.filter(a => a.gameId).map(a => a.gameId))];
            
            for (const gId of games) {
                const gameAchievements = allAchievements.filter(a => a.gameId === gId);
                const earnedInGame = gameAchievements.filter(a => earnedAchievementIds.includes(a.id)).length;
                const totalInGame = gameAchievements.length;

                gameProgress[gId] = {
                    earned: earnedInGame,
                    total: totalInGame,
                    percentage: totalInGame > 0 ? Math.round((earnedInGame / totalInGame) * 100) : 0
                };
            }
        }

        // Genel ilerleme durumunu hesapla
        const totalEarned = earnedAchievementIds.length;
        const totalAchievements = allAchievements.length;
        const overallPercentage = totalAchievements > 0 ? Math.round((totalEarned / totalAchievements) * 100) : 0;

        return Response.ok(res, 'Kullanıcı ilerleme durumu getirildi.', {
            genel: {
                kazanilan: totalEarned,
                toplam: totalAchievements,
                yuzde: overallPercentage
            },
            kategoriler: progress,
            oyunlar: !gameId ? gameProgress : undefined
        });
    } catch (error) {
        console.error(`Kullanıcı ilerleme durumu getirme hatası (UserID: ${userId}):`, error);
        return Response.internalServerError(res, 'Kullanıcı ilerleme durumu getirilirken bir hata oluştu.');
    }
};