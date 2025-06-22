// src/controllers/tournament/participant_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

/**
 * Turnuva katılımcılarını listeler
 */
exports.listTournamentParticipants = async (req, res) => {
    const { tournamentId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId }
        });

        if (!tournament) {
            return Response.notFound(res, 'Turnuva bulunamadı.');
        }

        const participants = await prisma.tournamentParticipant.findMany({
            where: { tournamentId },
            skip,
            take: parseInt(limit),
            orderBy: { createdAt: 'asc' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        nickname: true,
                        profilePictureUrl: true,
                        country: true,
                        playerSkill: {
                            where: { gameId: tournament.gameId },
                            select: { rating: true, level: true }
                        }
                    }
                }
            }
        });

        const totalParticipants = await prisma.tournamentParticipant.count({
            where: { tournamentId }
        });

        return Response.ok(res, 'Turnuva katılımcıları listelendi.', {
            katilimcilar: participants,
            meta: {
                toplamKatilimci: totalParticipants,
                suankiSayfa: parseInt(page),
                toplamSayfa: Math.ceil(totalParticipants / parseInt(limit))
            }
        });
    } catch (error) {
        console.error(`Turnuva katılımcıları listeleme hatası (ID: ${tournamentId}):`, error);
        return Response.internalServerError(res, 'Turnuva katılımcıları listelenirken bir hata oluştu.');
    }
};

/**
 * Turnuvadan çıkış yapar
 */
exports.withdrawFromTournament = async (req, res) => {
    const { tournamentId } = req.params;
    const userId = req.user.userId;

    try {
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId }
        });

        if (!tournament) {
            return Response.notFound(res, 'Turnuva bulunamadı.');
        }

        // Turnuva durumunu kontrol et
        if (tournament.status !== 'REGISTRATION_OPEN' && tournament.status !== 'UPCOMING') {
            return Response.badRequest(res, 'Turnuva başladıktan sonra çıkış yapamazsınız.');
        }

        // Kullanıcının turnuvaya kayıtlı olup olmadığını kontrol et
        const registration = await prisma.tournamentParticipant.findUnique({
            where: { tournamentId_userId: { tournamentId, userId } }
        });

        if (!registration) {
            return Response.notFound(res, 'Bu turnuvaya kayıtlı değilsiniz.');
        }

        // Turnuvadan çıkış yap
        await prisma.tournamentParticipant.delete({
            where: { tournamentId_userId: { tournamentId, userId } }
        });

        // Katılımcı sayısını güncelle
        await prisma.tournament.update({
            where: { id: tournamentId },
            data: { currentParticipants: { decrement: 1 } }
        });

        // Giriş ücreti iadesi (eğer turnuva başlamamışsa)
        if (tournament.entryFee > 0 && tournament.status === 'UPCOMING') {
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: userId },
                    data: { coins: { increment: tournament.entryFee } }
                }),
                prisma.transaction.create({
                    data: {
                        userId,
                        transactionType: 'TOURNAMENT_REFUND',
                        amount: tournament.entryFee,
                        currency: 'COIN',
                        relatedEntityId: tournamentId,
                        relatedEntityType: 'TOURNAMENT',
                        status: 'COMPLETED'
                    }
                })
            ]);

            return Response.ok(res, `Turnuvadan başarıyla çıkış yaptınız. ${tournament.entryFee.toString()} jeton iade edildi.`);
        }

        return Response.ok(res, 'Turnuvadan başarıyla çıkış yaptınız.');
    } catch (error) {
        console.error(`Turnuvadan çıkış hatası (ID: ${tournamentId}):`, error);
        return Response.internalServerError(res, 'Turnuvadan çıkış yapılırken bir hata oluştu.');
    }
};

/**
 * Kullanıcının katıldığı turnuvaları listeler
 */
exports.getUserTournaments = async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.userId;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereConditions = { userId };
    if (status) {
        whereConditions.tournament = { status: status.toUpperCase() };
    }

    try {
        const tournaments = await prisma.tournamentParticipant.findMany({
            where: whereConditions,
            skip,
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                tournament: {
                    include: {
                        game: { select: { id: true, name: true, iconUrl: true } },
                        organizer: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
                        _count: { select: { participants: true } }
                    }
                }
            }
        });

        const totalTournaments = await prisma.tournamentParticipant.count({
            where: whereConditions
        });

        return Response.ok(res, 'Kullanıcının turnuvaları listelendi.', {
            turnuvalar: tournaments.map(t => ({
                ...t.tournament,
                rank: t.rank,
                registeredAt: t.createdAt
            })),
            meta: {
                toplamTurnuva: totalTournaments,
                suankiSayfa: parseInt(page),
                toplamSayfa: Math.ceil(totalTournaments / parseInt(limit))
            }
        });
    } catch (error) {
        console.error(`Kullanıcı turnuvaları listeleme hatası (UserID: ${userId}):`, error);
        return Response.internalServerError(res, 'Kullanıcı turnuvaları listelenirken bir hata oluştu.');
    }
};

/**
 * Turnuva sıralamasını getirir
 */
exports.getTournamentLeaderboard = async (req, res) => {
    const { tournamentId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId }
        });

        if (!tournament) {
            return Response.notFound(res, 'Turnuva bulunamadı.');
        }

        // Sıralamayı getir (rank değerine göre sıralı)
        const leaderboard = await prisma.tournamentParticipant.findMany({
            where: { 
                tournamentId,
                rank: { not: null } // Sadece sıralamaya girmiş olanları getir
            },
            orderBy: { rank: 'asc' },
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

        const totalRanked = await prisma.tournamentParticipant.count({
            where: { 
                tournamentId,
                rank: { not: null }
            }
        });

        return Response.ok(res, 'Turnuva sıralaması getirildi.', {
            siralama: leaderboard,
            meta: {
                toplamKatilimci: totalRanked,
                suankiSayfa: parseInt(page),
                toplamSayfa: Math.ceil(totalRanked / parseInt(limit))
            }
        });
    } catch (error) {
        console.error(`Turnuva sıralaması getirme hatası (ID: ${tournamentId}):`, error);
        return Response.internalServerError(res, 'Turnuva sıralaması getirilirken bir hata oluştu.');
    }
};