// src/controllers/gameserver/gameserver_controller.js
const { PrismaClient, ServerStatus } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const axios = require('axios');

/**
 * Tüm oyun sunucularını listeler
 */
exports.listGameServers = async (req, res) => {
    const { page = 1, limit = 10, status, gameId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
        // Filtreleme koşullarını oluştur
        const whereCondition = {};
        if (status) whereCondition.status = status;
        if (gameId) whereCondition.gameId = gameId;

        // Sunucuları getir
        const servers = await prisma.gameServer.findMany({
            where: whereCondition,
            skip,
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                game: {
                    select: {
                        id: true,
                        name: true,
                        coverImageUrl: true
                    }
                }
            }
        });

        // Toplam sunucu sayısını getir
        const totalServers = await prisma.gameServer.count({
            where: whereCondition
        });

        return Response.ok(res, 'Oyun sunucuları listelendi.', {
            sunucular: servers,
            meta: {
                toplamSunucu: totalServers,
                suankiSayfa: parseInt(page),
                toplamSayfa: Math.ceil(totalServers / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Oyun sunucuları listeleme hatası:', error);
        return Response.internalServerError(res, 'Oyun sunucuları listelenirken bir hata oluştu.');
    }
};

/**
 * Belirli bir oyun sunucusunun detaylarını getirir
 */
exports.getGameServerById = async (req, res) => {
    const { serverId } = req.params;

    try {
        const server = await prisma.gameServer.findUnique({
            where: { id: serverId },
            include: {
                game: {
                    select: {
                        id: true,
                        name: true,
                        coverImageUrl: true,
                        description: true
                    }
                },
                serverSessions: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        startTime: true,
                        endTime: true,
                        status: true,
                        playerCount: true
                    }
                }
            }
        });

        if (!server) {
            return Response.notFound(res, 'Oyun sunucusu bulunamadı.');
        }

        // Sunucu durumunu kontrol et (opsiyonel)
        let serverStatus = server.status;
        if (server.healthCheckUrl) {
            try {
                const healthCheck = await axios.get(server.healthCheckUrl, { timeout: 5000 });
                if (healthCheck.status === 200) {
                    serverStatus = 'ONLINE';
                    // Sunucu durumunu güncelle
                    await prisma.gameServer.update({
                        where: { id: serverId },
                        data: { status: 'ONLINE', lastHealthCheck: new Date() }
                    });
                }
            } catch (healthError) {
                console.error(`Sunucu sağlık kontrolü hatası (ID: ${serverId}):`, healthError);
                serverStatus = 'OFFLINE';
                // Sunucu durumunu güncelle
                await prisma.gameServer.update({
                    where: { id: serverId },
                    data: { status: 'OFFLINE', lastHealthCheck: new Date() }
                });
            }
        }

        // Aktif oyuncu sayısını getir
        const activePlayers = await prisma.serverSession.count({
            where: {
                serverId,
                status: 'ACTIVE'
            }
        });

        return Response.ok(res, 'Oyun sunucusu detayları getirildi.', {
            sunucu: {
                ...server,
                status: serverStatus,
                activePlayers
            }
        });
    } catch (error) {
        console.error(`Oyun sunucusu getirme hatası (ID: ${serverId}):`, error);
        return Response.internalServerError(res, 'Oyun sunucusu detayları getirilirken bir hata oluştu.');
    }
};

/**
 * Yeni bir oyun sunucusu ekler (Admin için)
 */
exports.createGameServer = async (req, res) => {
    const { name, description, gameId, region, ipAddress, port, capacity, serverType, healthCheckUrl, apiKey } = req.body;

    // Yetki kontrolü middleware ile yapılacak (checkRole(['ADMIN']))

    try {
        // Gerekli alanları kontrol et
        if (!name || !gameId || !region || !ipAddress || !port) {
            return Response.badRequest(res, 'Oyun sunucusu eklemek için gerekli alanları doldurunuz.');
        }

        // Oyunun var olup olmadığını kontrol et
        const game = await prisma.game.findUnique({
            where: { id: gameId }
        });

        if (!game) {
            return Response.notFound(res, 'Belirtilen oyun bulunamadı.');
        }

        // Sunucuyu oluştur
        const newServer = await prisma.gameServer.create({
            data: {
                name,
                description,
                gameId,
                region,
                ipAddress,
                port: parseInt(port),
                capacity: capacity ? parseInt(capacity) : 100,
                serverType: serverType || 'STANDARD',
                status: 'OFFLINE', // Başlangıçta offline olarak ayarla
                healthCheckUrl,
                apiKey,
                lastHealthCheck: new Date()
            }
        });

        return Response.created(res, 'Oyun sunucusu başarıyla eklendi.', { sunucu: newServer });
    } catch (error) {
        console.error('Oyun sunucusu ekleme hatası:', error);
        return Response.internalServerError(res, 'Oyun sunucusu eklenirken bir hata oluştu.');
    }
};

/**
 * Oyun sunucusunu günceller (Admin için)
 */
exports.updateGameServer = async (req, res) => {
    const { serverId } = req.params;
    const { name, description, region, ipAddress, port, capacity, serverType, healthCheckUrl, apiKey, status } = req.body;

    // Yetki kontrolü middleware ile yapılacak (checkRole(['ADMIN']))

    try {
        // Sunucunun var olup olmadığını kontrol et
        const server = await prisma.gameServer.findUnique({
            where: { id: serverId }
        });

        if (!server) {
            return Response.notFound(res, 'Oyun sunucusu bulunamadı.');
        }

        // Güncellenecek verileri hazırla
        const updateData = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (region) updateData.region = region;
        if (ipAddress) updateData.ipAddress = ipAddress;
        if (port) updateData.port = parseInt(port);
        if (capacity) updateData.capacity = parseInt(capacity);
        if (serverType) updateData.serverType = serverType;
        if (healthCheckUrl !== undefined) updateData.healthCheckUrl = healthCheckUrl;
        if (apiKey !== undefined) updateData.apiKey = apiKey;
        if (status) updateData.status = status;

        // Sunucuyu güncelle
        const updatedServer = await prisma.gameServer.update({
            where: { id: serverId },
            data: updateData
        });

        return Response.ok(res, 'Oyun sunucusu başarıyla güncellendi.', { sunucu: updatedServer });
    } catch (error) {
        console.error(`Oyun sunucusu güncelleme hatası (ID: ${serverId}):`, error);
        return Response.internalServerError(res, 'Oyun sunucusu güncellenirken bir hata oluştu.');
    }
};

/**
 * Oyun sunucusunu siler (Admin için)
 */
exports.deleteGameServer = async (req, res) => {
    const { serverId } = req.params;

    // Yetki kontrolü middleware ile yapılacak (checkRole(['ADMIN']))

    try {
        // Sunucunun var olup olmadığını kontrol et
        const server = await prisma.gameServer.findUnique({
            where: { id: serverId }
        });

        if (!server) {
            return Response.notFound(res, 'Oyun sunucusu bulunamadı.');
        }

        // Aktif oturumları kontrol et
        const activeSessions = await prisma.serverSession.count({
            where: {
                serverId,
                status: 'ACTIVE'
            }
        });

        if (activeSessions > 0) {
            return Response.badRequest(res, 'Bu sunucuda aktif oturumlar bulunduğu için silinemez. Önce sunucuyu devre dışı bırakın ve aktif oturumların tamamlanmasını bekleyin.');
        }

        // Sunucuyu sil
        await prisma.gameServer.delete({
            where: { id: serverId }
        });

        return Response.ok(res, 'Oyun sunucusu başarıyla silindi.');
    } catch (error) {
        console.error(`Oyun sunucusu silme hatası (ID: ${serverId}):`, error);
        return Response.internalServerError(res, 'Oyun sunucusu silinirken bir hata oluştu.');
    }
};

/**
 * Sunucu durumunu günceller (Admin veya sistem için)
 */
exports.updateServerStatus = async (req, res) => {
    const { serverId } = req.params;
    const { status, message } = req.body;

    // Yetki kontrolü middleware ile yapılacak (checkRole(['ADMIN', 'SYSTEM']))

    try {
        // Sunucunun var olup olmadığını kontrol et
        const server = await prisma.gameServer.findUnique({
            where: { id: serverId }
        });

        if (!server) {
            return Response.notFound(res, 'Oyun sunucusu bulunamadı.');
        }

        // Geçerli bir durum değeri mi kontrol et
        const validStatuses = ['ONLINE', 'OFFLINE', 'MAINTENANCE', 'RESTARTING'];
        if (!validStatuses.includes(status)) {
            return Response.badRequest(res, 'Geçersiz sunucu durumu.');
        }

        // Sunucu durumunu güncelle
        const updatedServer = await prisma.gameServer.update({
            where: { id: serverId },
            data: {
                status,
                statusMessage: message,
                lastHealthCheck: new Date()
            }
        });

        return Response.ok(res, 'Sunucu durumu güncellendi.', { sunucu: updatedServer });
    } catch (error) {
        console.error(`Sunucu durumu güncelleme hatası (ID: ${serverId}):`, error);
        return Response.internalServerError(res, 'Sunucu durumu güncellenirken bir hata oluştu.');
    }
};

/**
 * Sunucu sağlık kontrolü yapar
 * Bu fonksiyon zamanlanmış görevler tarafından çağrılabilir
 */
exports.checkServerHealth = async () => {
    try {
        // Tüm aktif sunucuları getir
        const servers = await prisma.gameServer.findMany({
            where: {
                healthCheckUrl: { not: null }
            },
            select: {
                id: true,
                name: true,
                healthCheckUrl: true,
                status: true
            }
        });

        const results = [];

        // Her sunucu için sağlık kontrolü yap
        for (const server of servers) {
            try {
                const healthCheck = await axios.get(server.healthCheckUrl, { timeout: 5000 });
                
                // Sunucu durumunu güncelle
                if (healthCheck.status === 200) {
                    await prisma.gameServer.update({
                        where: { id: server.id },
                        data: {
                            status: 'ONLINE',
                            lastHealthCheck: new Date(),
                            statusMessage: null
                        }
                    });
                    
                    results.push({
                        serverId: server.id,
                        name: server.name,
                        status: 'ONLINE',
                        success: true
                    });
                }
            } catch (healthError) {
                // Sunucu yanıt vermiyorsa offline olarak işaretle
                await prisma.gameServer.update({
                    where: { id: server.id },
                    data: {
                        status: 'OFFLINE',
                        lastHealthCheck: new Date(),
                        statusMessage: 'Sunucu yanıt vermiyor.'
                    }
                });
                
                results.push({
                    serverId: server.id,
                    name: server.name,
                    status: 'OFFLINE',
                    success: false,
                    error: healthError.message
                });
            }
        }

        return { success: true, results };
    } catch (error) {
        console.error('Sunucu sağlık kontrolü hatası:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Sunucu oturumlarını listeler
 */
exports.listServerSessions = async (req, res) => {
    const { serverId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
        // Sunucunun var olup olmadığını kontrol et
        const server = await prisma.gameServer.findUnique({
            where: { id: serverId }
        });

        if (!server) {
            return Response.notFound(res, 'Oyun sunucusu bulunamadı.');
        }

        // Filtreleme koşullarını oluştur
        const whereCondition = { serverId };
        if (status) whereCondition.status = status;

        // Oturumları getir
        const sessions = await prisma.serverSession.findMany({
            where: whereCondition,
            skip,
            take: parseInt(limit),
            orderBy: { startTime: 'desc' },
            include: {
                gameSession: {
                    select: {
                        id: true,
                        gameId: true,
                        status: true,
                        participants: {
                            select: {
                                user: {
                                    select: {
                                        id: true,
                                        username: true,
                                        nickname: true,
                                        avatarUrl: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Toplam oturum sayısını getir
        const totalSessions = await prisma.serverSession.count({
            where: whereCondition
        });

        return Response.ok(res, 'Sunucu oturumları listelendi.', {
            oturumlar: sessions,
            meta: {
                toplamOturum: totalSessions,
                suankiSayfa: parseInt(page),
                toplamSayfa: Math.ceil(totalSessions / parseInt(limit))
            }
        });
    } catch (error) {
        console.error(`Sunucu oturumları listeleme hatası (ServerID: ${serverId}):`, error);
        return Response.internalServerError(res, 'Sunucu oturumları listelenirken bir hata oluştu.');
    }
};

/**
 * Yeni bir sunucu oturumu başlatır
 */
exports.startServerSession = async (req, res) => {
    const { serverId, gameSessionId, config } = req.body;

    try {
        // Sunucunun var olup olmadığını kontrol et
        const server = await prisma.gameServer.findUnique({
            where: { id: serverId }
        });

        if (!server) {
            return Response.notFound(res, 'Oyun sunucusu bulunamadı.');
        }

        // Sunucu durumunu kontrol et
        if (server.status !== 'ONLINE') {
            return Response.badRequest(res, 'Sunucu şu anda çevrimiçi değil. Oturum başlatılamaz.');
        }

        // Oyun oturumunun var olup olmadığını kontrol et
        if (gameSessionId) {
            const gameSession = await prisma.gameSession.findUnique({
                where: { id: gameSessionId }
            });

            if (!gameSession) {
                return Response.notFound(res, 'Belirtilen oyun oturumu bulunamadı.');
            }
        }

        // Sunucu kapasitesini kontrol et
        const activeSessions = await prisma.serverSession.count({
            where: {
                serverId,
                status: 'ACTIVE'
            }
        });

        if (activeSessions >= server.capacity) {
            return Response.badRequest(res, 'Sunucu kapasitesi dolu. Yeni oturum başlatılamaz.');
        }

        // Yeni oturum oluştur
        const newSession = await prisma.serverSession.create({
            data: {
                serverId,
                gameSessionId,
                startTime: new Date(),
                status: 'ACTIVE',
                config: config || {},
                playerCount: 0
            }
        });

        // Sunucu API'sine istek gönder (opsiyonel)
        if (server.apiKey && server.ipAddress && server.port) {
            try {
                const apiUrl = `http://${server.ipAddress}:${server.port}/api/sessions/start`;
                const apiResponse = await axios.post(apiUrl, {
                    sessionId: newSession.id,
                    gameSessionId,
                    config: config || {}
                }, {
                    headers: {
                        'Authorization': `Bearer ${server.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                });

                // API yanıtını kaydet
                await prisma.serverSession.update({
                    where: { id: newSession.id },
                    data: {
                        serverResponse: apiResponse.data,
                        connectionInfo: apiResponse.data.connectionInfo || {}
                    }
                });
            } catch (apiError) {
                console.error(`Sunucu API hatası (ServerID: ${serverId}):`, apiError);
                // Oturumu iptal et
                await prisma.serverSession.update({
                    where: { id: newSession.id },
                    data: {
                        status: 'FAILED',
                        endTime: new Date(),
                        statusMessage: 'Sunucu API hatası: ' + apiError.message
                    }
                });

                return Response.internalServerError(res, 'Sunucu API hatası nedeniyle oturum başlatılamadı.');
            }
        }

        return Response.created(res, 'Sunucu oturumu başarıyla başlatıldı.', { oturum: newSession });
    } catch (error) {
        console.error(`Sunucu oturumu başlatma hatası (ServerID: ${serverId}):`, error);
        return Response.internalServerError(res, 'Sunucu oturumu başlatılırken bir hata oluştu.');
    }
};

/**
 * Sunucu oturumunu sonlandırır
 */
exports.endServerSession = async (req, res) => {
    const { sessionId } = req.params;
    const { reason } = req.body;

    try {
        // Oturumun var olup olmadığını kontrol et
        const session = await prisma.serverSession.findUnique({
            where: { id: sessionId },
            include: { server: true }
        });

        if (!session) {
            return Response.notFound(res, 'Sunucu oturumu bulunamadı.');
        }

        // Oturum zaten sonlandırılmış mı kontrol et
        if (session.status !== 'ACTIVE') {
            return Response.badRequest(res, 'Bu oturum zaten sonlandırılmış.');
        }

        // Sunucu API'sine istek gönder (opsiyonel)
        if (session.server.apiKey && session.server.ipAddress && session.server.port) {
            try {
                const apiUrl = `http://${session.server.ipAddress}:${session.server.port}/api/sessions/end`;
                await axios.post(apiUrl, {
                    sessionId: session.id,
                    reason: reason || 'Normal termination'
                }, {
                    headers: {
                        'Authorization': `Bearer ${session.server.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                });
            } catch (apiError) {
                console.error(`Sunucu API hatası (SessionID: ${sessionId}):`, apiError);
                // API hatası olsa bile oturumu sonlandırmaya devam et
            }
        }

        // Oturumu sonlandır
        const updatedSession = await prisma.serverSession.update({
            where: { id: sessionId },
            data: {
                status: 'COMPLETED',
                endTime: new Date(),
                statusMessage: reason || 'Normal termination'
            }
        });

        // İlişkili oyun oturumunu güncelle (varsa)
        if (session.gameSessionId) {
            await prisma.gameSession.update({
                where: { id: session.gameSessionId },
                data: { status: 'COMPLETED' }
            });
        }

        return Response.ok(res, 'Sunucu oturumu başarıyla sonlandırıldı.', { oturum: updatedSession });
    } catch (error) {
        console.error(`Sunucu oturumu sonlandırma hatası (SessionID: ${sessionId}):`, error);
        return Response.internalServerError(res, 'Sunucu oturumu sonlandırılırken bir hata oluştu.');
    }
};

/**
 * Sunucu oturumuna oyuncu ekler
 */
exports.addPlayerToSession = async (req, res) => {
    const { sessionId } = req.params;
    const { userId } = req.body;
    const requestUserId = req.user.userId;

    try {
        // Oturumun var olup olmadığını kontrol et
        const session = await prisma.serverSession.findUnique({
            where: { id: sessionId },
            include: { server: true }
        });

        if (!session) {
            return Response.notFound(res, 'Sunucu oturumu bulunamadı.');
        }

        // Oturum aktif mi kontrol et
        if (session.status !== 'ACTIVE') {
            return Response.badRequest(res, 'Bu oturum aktif değil. Oyuncu eklenemez.');
        }

        // Kullanıcının var olup olmadığını kontrol et
        const user = await prisma.user.findUnique({
            where: { id: userId || requestUserId }
        });

        if (!user) {
            return Response.notFound(res, 'Kullanıcı bulunamadı.');
        }

        // Kullanıcı zaten oturumda mı kontrol et
        const existingPlayer = await prisma.serverSessionPlayer.findFirst({
            where: {
                sessionId,
                userId: userId || requestUserId
            }
        });

        if (existingPlayer) {
            return Response.badRequest(res, 'Bu kullanıcı zaten oturuma katılmış.');
        }

        // Oyuncu sayısını kontrol et
        const playerCount = await prisma.serverSessionPlayer.count({
            where: { sessionId }
        });

        if (playerCount >= session.server.capacity) {
            return Response.badRequest(res, 'Oturum kapasitesi dolu. Yeni oyuncu eklenemez.');
        }

        // Oyuncuyu oturuma ekle
        const newPlayer = await prisma.serverSessionPlayer.create({
            data: {
                sessionId,
                userId: userId || requestUserId,
                joinTime: new Date(),
                status: 'ACTIVE'
            }
        });

        // Oturumdaki oyuncu sayısını güncelle
        await prisma.serverSession.update({
            where: { id: sessionId },
            data: { playerCount: playerCount + 1 }
        });

        // Sunucu API'sine istek gönder (opsiyonel)
        if (session.server.apiKey && session.server.ipAddress && session.server.port) {
            try {
                const apiUrl = `http://${session.server.ipAddress}:${session.server.port}/api/sessions/players/add`;
                const apiResponse = await axios.post(apiUrl, {
                    sessionId,
                    userId: userId || requestUserId,
                    username: user.username
                }, {
                    headers: {
                        'Authorization': `Bearer ${session.server.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                });

                // API yanıtını kaydet
                await prisma.serverSessionPlayer.update({
                    where: { id: newPlayer.id },
                    data: {
                        connectionInfo: apiResponse.data.connectionInfo || {}
                    }
                });

                return Response.created(res, 'Oyuncu oturuma başarıyla eklendi.', {
                    oyuncu: newPlayer,
                    connectionInfo: apiResponse.data.connectionInfo || {}
                });
            } catch (apiError) {
                console.error(`Sunucu API hatası (SessionID: ${sessionId}):`, apiError);
                // API hatası olsa bile oyuncuyu ekledik, bu yüzden başarılı dönüş yap
            }
        }

        return Response.created(res, 'Oyuncu oturuma başarıyla eklendi.', { oyuncu: newPlayer });
    } catch (error) {
        console.error(`Oturuma oyuncu ekleme hatası (SessionID: ${sessionId}):`, error);
        return Response.internalServerError(res, 'Oturuma oyuncu eklenirken bir hata oluştu.');
    }
};

/**
 * Sunucu oturumundan oyuncu çıkarır
 */
exports.removePlayerFromSession = async (req, res) => {
    const { sessionId, playerId } = req.params;
    const { reason } = req.body;
    const requestUserId = req.user.userId;

    try {
        // Oturumun var olup olmadığını kontrol et
        const session = await prisma.serverSession.findUnique({
            where: { id: sessionId },
            include: { server: true }
        });

        if (!session) {
            return Response.notFound(res, 'Sunucu oturumu bulunamadı.');
        }

        // Oyuncunun var olup olmadığını kontrol et
        let player;
        if (playerId) {
            player = await prisma.serverSessionPlayer.findUnique({
                where: { id: playerId }
            });
        } else {
            player = await prisma.serverSessionPlayer.findFirst({
                where: {
                    sessionId,
                    userId: requestUserId,
                    status: 'ACTIVE'
                }
            });
        }

        if (!player) {
            return Response.notFound(res, 'Oyuncu bulunamadı.');
        }

        // Yetki kontrolü (admin değilse sadece kendini çıkarabilir)
        if (player.userId !== requestUserId && req.user.role !== 'ADMIN') {
            return Response.forbidden(res, 'Başka bir oyuncuyu çıkarma yetkiniz yok.');
        }

        // Sunucu API'sine istek gönder (opsiyonel)
        if (session.server.apiKey && session.server.ipAddress && session.server.port) {
            try {
                const apiUrl = `http://${session.server.ipAddress}:${session.server.port}/api/sessions/players/remove`;
                await axios.post(apiUrl, {
                    sessionId,
                    playerId: player.id,
                    userId: player.userId,
                    reason: reason || 'User left'
                }, {
                    headers: {
                        'Authorization': `Bearer ${session.server.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                });
            } catch (apiError) {
                console.error(`Sunucu API hatası (SessionID: ${sessionId}, PlayerID: ${player.id}):`, apiError);
                // API hatası olsa bile oyuncuyu çıkarmaya devam et
            }
        }

        // Oyuncuyu çıkar
        await prisma.serverSessionPlayer.update({
            where: { id: player.id },
            data: {
                status: 'LEFT',
                leaveTime: new Date(),
                leaveReason: reason || 'User left'
            }
        });

        // Oturumdaki oyuncu sayısını güncelle
        const activePlayerCount = await prisma.serverSessionPlayer.count({
            where: {
                sessionId,
                status: 'ACTIVE'
            }
        });

        await prisma.serverSession.update({
            where: { id: sessionId },
            data: { playerCount: activePlayerCount }
        });

        return Response.ok(res, 'Oyuncu oturumdan başarıyla çıkarıldı.');
    } catch (error) {
        console.error(`Oturumdan oyuncu çıkarma hatası (SessionID: ${sessionId}):`, error);
        return Response.internalServerError(res, 'Oturumdan oyuncu çıkarılırken bir hata oluştu.');
    }
};

/**
 * Sunucu oturumundaki oyuncuları listeler
 */
exports.listSessionPlayers = async (req, res) => {
    const { sessionId } = req.params;
    const { status } = req.query;

    try {
        // Oturumun var olup olmadığını kontrol et
        const session = await prisma.serverSession.findUnique({
            where: { id: sessionId }
        });

        if (!session) {
            return Response.notFound(res, 'Sunucu oturumu bulunamadı.');
        }

        // Filtreleme koşullarını oluştur
        const whereCondition = { sessionId };
        if (status) whereCondition.status = status;

        // Oyuncuları getir
        const players = await prisma.serverSessionPlayer.findMany({
            where: whereCondition,
            orderBy: { joinTime: 'asc' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        nickname: true,
                        avatarUrl: true
                    }
                }
            }
        });

        return Response.ok(res, 'Oturum oyuncuları listelendi.', { oyuncular: players });
    } catch (error) {
        console.error(`Oturum oyuncuları listeleme hatası (SessionID: ${sessionId}):`, error);
        return Response.internalServerError(res, 'Oturum oyuncuları listelenirken bir hata oluştu.');
    }
};