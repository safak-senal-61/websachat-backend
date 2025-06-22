// src/controllers/matchmaking/matchmaking_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

/**
 * Kullanıcının beceri seviyesini günceller
 * Bu fonksiyon oyun sonuçlarına göre çağrılabilir
 */
exports.updatePlayerSkill = async (userId, gameId, outcome, opponentRating = null) => {
    try {
        // Kullanıcının mevcut beceri seviyesini bul
        let playerSkill = await prisma.playerSkill.findUnique({
            where: {
                userId_gameId: {
                    userId,
                    gameId
                }
            }
        });

        // Eğer kayıt yoksa yeni oluştur
        if (!playerSkill) {
            playerSkill = await prisma.playerSkill.create({
                data: {
                    userId,
                    gameId,
                    rating: 1000, // Başlangıç puanı
                    gamesPlayed: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    level: 1
                }
            });
        }

        // Oyun sonucuna göre istatistikleri güncelle
        const updateData = {
            gamesPlayed: { increment: 1 }
        };

        // Kazanma/kaybetme/beraberlik durumlarını güncelle
        if (outcome === 'WIN') {
            updateData.wins = { increment: 1 };
        } else if (outcome === 'LOSS') {
            updateData.losses = { increment: 1 };
        } else if (outcome === 'DRAW') {
            updateData.draws = { increment: 1 };
        }

        // ELO puanı hesaplama (eğer rakip puanı verilmişse)
        if (opponentRating) {
            const k = 32; // K faktörü (değişim hızı)
            const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerSkill.rating) / 400));
            let actualScore = 0.5; // Beraberlik
            
            if (outcome === 'WIN') actualScore = 1;
            else if (outcome === 'LOSS') actualScore = 0;
            
            const ratingChange = Math.round(k * (actualScore - expectedScore));
            updateData.rating = { increment: ratingChange };
            
            // Seviye hesaplama (her 100 puan için 1 seviye)
            const newRating = playerSkill.rating + ratingChange;
            const newLevel = Math.floor(newRating / 100) + 1;
            
            if (newLevel !== playerSkill.level) {
                updateData.level = newLevel;
            }
        }

        // Beceri seviyesini güncelle
        const updatedSkill = await prisma.playerSkill.update({
            where: {
                userId_gameId: {
                    userId,
                    gameId
                }
            },
            data: updateData
        });

        return updatedSkill;
    } catch (error) {
        console.error(`Oyuncu beceri seviyesi güncelleme hatası (UserID: ${userId}, GameID: ${gameId}):`, error);
        return null;
    }
};

/**
 * Kullanıcının beceri seviyesini getirir
 */
exports.getPlayerSkill = async (req, res) => {
    const { userId, gameId } = req.params;

    try {
        // Kullanıcının var olup olmadığını kontrol et
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return Response.notFound(res, 'Kullanıcı bulunamadı.');
        }

        // Oyunun var olup olmadığını kontrol et
        const game = await prisma.game.findUnique({
            where: { id: gameId }
        });

        if (!game) {
            return Response.notFound(res, 'Oyun bulunamadı.');
        }

        // Beceri seviyesini getir
        const playerSkill = await prisma.playerSkill.findUnique({
            where: {
                userId_gameId: {
                    userId,
                    gameId
                }
            }
        });

        if (!playerSkill) {
            return Response.notFound(res, 'Bu oyun için beceri seviyesi kaydı bulunamadı.');
        }

        return Response.ok(res, 'Oyuncu beceri seviyesi getirildi.', { beceriSeviyesi: playerSkill });
    } catch (error) {
        console.error(`Oyuncu beceri seviyesi getirme hatası (UserID: ${userId}, GameID: ${gameId}):`, error);
        return Response.internalServerError(res, 'Oyuncu beceri seviyesi getirilirken bir hata oluştu.');
    }
};

/**
 * Kullanıcının tüm oyunlardaki beceri seviyelerini getirir
 */
exports.getPlayerAllSkills = async (req, res) => {
    const { userId } = req.params;

    try {
        // Kullanıcının var olup olmadığını kontrol et
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return Response.notFound(res, 'Kullanıcı bulunamadı.');
        }

        // Tüm beceri seviyelerini getir
        const playerSkills = await prisma.playerSkill.findMany({
            where: { userId },
            include: {
                game: {
                    select: {
                        id: true,
                        name: true,
                        iconUrl: true
                    }
                }
            }
        });

        return Response.ok(res, 'Oyuncu beceri seviyeleri getirildi.', { beceriSeviyeleri: playerSkills });
    } catch (error) {
        console.error(`Oyuncu beceri seviyeleri getirme hatası (UserID: ${userId}):`, error);
        return Response.internalServerError(res, 'Oyuncu beceri seviyeleri getirilirken bir hata oluştu.');
    }
};

/**
 * Kullanıcının kendi beceri seviyelerini getirir
 */
exports.getMySkills = async (req, res) => {
    const userId = req.user.userId;

    try {
        // Tüm beceri seviyelerini getir
        const playerSkills = await prisma.playerSkill.findMany({
            where: { userId },
            include: {
                game: {
                    select: {
                        id: true,
                        name: true,
                        iconUrl: true
                    }
                }
            }
        });

        return Response.ok(res, 'Beceri seviyeleriniz getirildi.', { beceriSeviyeleri: playerSkills });
    } catch (error) {
        console.error(`Oyuncu beceri seviyeleri getirme hatası (UserID: ${userId}):`, error);
        return Response.internalServerError(res, 'Beceri seviyeleriniz getirilirken bir hata oluştu.');
    }
};

/**
 * Oyun için sıralama listesini getirir
 */
exports.getGameLeaderboard = async (req, res) => {
    const { gameId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
        // Oyunun var olup olmadığını kontrol et
        const game = await prisma.game.findUnique({
            where: { id: gameId }
        });

        if (!game) {
            return Response.notFound(res, 'Oyun bulunamadı.');
        }

        // Sıralama listesini getir
        const leaderboard = await prisma.playerSkill.findMany({
            where: { gameId },
            orderBy: { rating: 'desc' },
            skip,
            take: parseInt(limit),
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        nickname: true,
                        profilePictureUrl: true,
                        country: true
                    }
                }
            }
        });

        const totalPlayers = await prisma.playerSkill.count({
            where: { gameId }
        });

        return Response.ok(res, 'Oyun sıralama listesi getirildi.', {
            siralama: leaderboard,
            meta: {
                toplamOyuncu: totalPlayers,
                suankiSayfa: parseInt(page),
                toplamSayfa: Math.ceil(totalPlayers / parseInt(limit))
            }
        });
    } catch (error) {
        console.error(`Oyun sıralama listesi getirme hatası (GameID: ${gameId}):`, error);
        return Response.internalServerError(res, 'Oyun sıralama listesi getirilirken bir hata oluştu.');
    }
};

/**
 * Eşleştirme kuyruğuna katılır
 */
exports.joinMatchmakingQueue = async (req, res) => {
    const { gameId } = req.params;
    const userId = req.user.userId;

    try {
        // Oyunun var olup olmadığını kontrol et
        const game = await prisma.game.findUnique({
            where: { id: gameId }
        });

        if (!game) {
            return Response.notFound(res, 'Oyun bulunamadı.');
        }

        // Kullanıcının zaten kuyrukta olup olmadığını kontrol et
        const existingQueue = await prisma.matchmakingQueue.findFirst({
            where: {
                userId,
                status: 'WAITING'
            }
        });

        if (existingQueue) {
            return Response.badRequest(res, 'Zaten bir eşleştirme kuyruğundasınız.');
        }

        // Kullanıcının beceri seviyesini getir veya oluştur
        let playerSkill = await prisma.playerSkill.findUnique({
            where: {
                userId_gameId: {
                    userId,
                    gameId
                }
            }
        });

        if (!playerSkill) {
            playerSkill = await prisma.playerSkill.create({
                data: {
                    userId,
                    gameId,
                    rating: 1000,
                    gamesPlayed: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    level: 1
                }
            });
        }

        // Kuyruğa ekle
        const queueEntry = await prisma.matchmakingQueue.create({
            data: {
                userId,
                gameId,
                rating: playerSkill.rating,
                joinedAt: new Date(),
                status: 'WAITING'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        nickname: true
                    }
                },
                game: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // Eşleşme bul (benzer beceri seviyesindeki diğer oyuncular)
        const potentialMatches = await prisma.matchmakingQueue.findMany({
            where: {
                gameId,
                userId: { not: userId },
                status: 'WAITING',
                rating: {
                    gte: playerSkill.rating - 200,
                    lte: playerSkill.rating + 200
                }
            },
            orderBy: [
                { rating: 'desc' },
                { joinedAt: 'asc' }
            ],
            take: 1,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        nickname: true
                    }
                }
            }
        });

        // Eğer eşleşme bulunduysa
        if (potentialMatches.length > 0) {
            const match = potentialMatches[0];

            // Oyun oturumu oluştur
            const gameSession = await prisma.gameSession.create({
                data: {
                    gameId,
                    status: 'ACTIVE',
                    startTime: new Date(),
                    players: {
                        create: [
                            {
                                userId,
                                joinedAt: new Date()
                            },
                            {
                                userId: match.userId,
                                joinedAt: new Date()
                            }
                        ]
                    }
                },
                include: {
                    game: true,
                    players: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    nickname: true,
                                    profilePictureUrl: true
                                }
                            }
                        }
                    }
                }
            });

            // Kuyruk durumlarını güncelle
            await prisma.matchmakingQueue.updateMany({
                where: {
                    id: { in: [queueEntry.id, match.id] }
                },
                data: {
                    status: 'MATCHED',
                    matchedAt: new Date(),
                    gameSessionId: gameSession.id
                }
            });

            // Oyunculara bildirim gönder
            // TODO: Bildirim gönderme işlemi

            return Response.ok(res, 'Eşleşme bulundu!', {
                eslesme: true,
                oyunOturumu: gameSession
            });
        }

        return Response.ok(res, 'Eşleştirme kuyruğuna katıldınız. Lütfen bekleyin...', {
            eslesme: false,
            kuyruk: queueEntry
        });
    } catch (error) {
        console.error(`Eşleştirme kuyruğuna katılma hatası (UserID: ${userId}, GameID: ${gameId}):`, error);
        return Response.internalServerError(res, 'Eşleştirme kuyruğuna katılırken bir hata oluştu.');
    }
};

/**
 * Eşleştirme kuyruğundan çıkar
 */
exports.leaveMatchmakingQueue = async (req, res) => {
    const { gameId } = req.params;
    const userId = req.user.userId;

    try {
        // Kullanıcının kuyrukta olup olmadığını kontrol et
        const queueEntry = await prisma.matchmakingQueue.findFirst({
            where: {
                userId,
                gameId,
                status: 'WAITING'
            }
        });

        if (!queueEntry) {
            return Response.notFound(res, 'Aktif bir eşleştirme kuyruğu bulunamadı.');
        }

        // Kuyruktan çıkar
        await prisma.matchmakingQueue.update({
            where: { id: queueEntry.id },
            data: { status: 'CANCELLED' }
        });

        return Response.ok(res, 'Eşleştirme kuyruğundan başarıyla çıktınız.');
    } catch (error) {
        console.error(`Eşleştirme kuyruğundan çıkma hatası (UserID: ${userId}, GameID: ${gameId}):`, error);
        return Response.internalServerError(res, 'Eşleştirme kuyruğundan çıkarken bir hata oluştu.');
    }
};

/**
 * Kuyruk durumunu kontrol eder
 */
exports.checkQueueStatus = async (req, res) => {
    const { queueId } = req.params;
    const userId = req.user.userId;

    try {
        // Kuyruk kaydını getir
        const queueEntry = await prisma.matchmakingQueue.findUnique({
            where: { id: queueId },
            include: {
                gameSession: {
                    include: {
                        game: true,
                        players: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        username: true,
                                        nickname: true,
                                        profilePictureUrl: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!queueEntry) {
            return Response.notFound(res, 'Eşleştirme kaydı bulunamadı.');
        }

        // Yetki kontrolü
        if (queueEntry.userId !== userId) {
            return Response.forbidden(res, 'Bu eşleştirme kaydını görüntüleme yetkiniz yok.');
        }

        // Durum kontrolü
        if (queueEntry.status === 'MATCHED') {
            return Response.ok(res, 'Eşleşme bulundu!', {
                durum: queueEntry.status,
                eslesme: true,
                oyunOturumu: queueEntry.gameSession
            });
        } else if (queueEntry.status === 'WAITING') {
            // Bekleme süresi hesapla
            const waitingTime = Math.floor((new Date() - queueEntry.joinedAt) / 1000); // saniye cinsinden
            
            return Response.ok(res, 'Eşleşme bekleniyor...', {
                durum: queueEntry.status,
                eslesme: false,
                beklemeSuresi: waitingTime
            });
        } else {
            return Response.ok(res, 'Eşleştirme kuyruğu durumu.', {
                durum: queueEntry.status,
                eslesme: false
            });
        }
    } catch (error) {
        console.error(`Kuyruk durumu kontrol hatası (QueueID: ${queueId}):`, error);
        return Response.internalServerError(res, 'Kuyruk durumu kontrol edilirken bir hata oluştu.');
    }
};

/**
 * Özel oyun oturumu oluşturur (arkadaşlarla oynamak için)
 */
exports.createCustomGameSession = async (req, res) => {
    const { gameId, playerIds, settings } = req.body;
    const hostId = req.user.userId;

    try {
        // Oyunun var olup olmadığını kontrol et
        const game = await prisma.game.findUnique({
            where: { id: gameId }
        });

        if (!game) {
            return Response.notFound(res, 'Oyun bulunamadı.');
        }

        // Oyuncu listesini kontrol et
        if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
            return Response.badRequest(res, 'Geçerli bir oyuncu listesi belirtiniz.');
        }

        // Kendisini de ekle
        const allPlayerIds = [...new Set([hostId, ...playerIds])];

        // Oyuncuların var olup olmadığını kontrol et
        const players = await prisma.user.findMany({
            where: { id: { in: allPlayerIds } },
            select: { id: true }
        });

        if (players.length !== allPlayerIds.length) {
            return Response.badRequest(res, 'Bazı oyuncular bulunamadı.');
        }

        // Oyun oturumu oluştur
        const gameSession = await prisma.gameSession.create({
            data: {
                gameId,
                hostId,
                status: 'WAITING',
                isPrivate: true,
                settings: settings || {},
                players: {
                    create: allPlayerIds.map(playerId => ({
                        userId: playerId,
                        joinedAt: new Date(),
                        status: playerId === hostId ? 'READY' : 'INVITED'
                    }))
                }
            },
            include: {
                game: true,
                host: {
                    select: {
                        id: true,
                        username: true,
                        nickname: true,
                        profilePictureUrl: true
                    }
                },
                players: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                nickname: true,
                                profilePictureUrl: true
                            }
                        }
                    }
                }
            }
        });

        // Davet edilen oyunculara bildirim gönder
        // TODO: Bildirim gönderme işlemi

        return Response.created(res, 'Özel oyun oturumu oluşturuldu.', { oyunOturumu: gameSession });
    } catch (error) {
        console.error(`Özel oyun oturumu oluşturma hatası (UserID: ${hostId}, GameID: ${gameId}):`, error);
        return Response.internalServerError(res, 'Özel oyun oturumu oluşturulurken bir hata oluştu.');
    }
};