// src/controllers/tournament/match_controller.js
const { PrismaClient, MatchStatus } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

/**
 * Turnuva maçlarını listeler
 */
exports.listTournamentMatches = async (req, res) => {
    const { tournamentId } = req.params;
    const { round, status } = req.query;

    try {
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId }
        });

        if (!tournament) {
            return Response.notFound(res, 'Turnuva bulunamadı.');
        }

        // Filtreleme koşullarını oluştur
        const whereConditions = { tournamentId };
        if (round) whereConditions.round = parseInt(round);
        if (status) whereConditions.status = status.toUpperCase();

        const matches = await prisma.tournamentMatch.findMany({
            where: whereConditions,
            orderBy: [
                { round: 'asc' },
                { matchNumber: 'asc' }
            ],
            include: {
                player1: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
                player2: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
                winner: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } }
            }
        });

        return Response.ok(res, 'Turnuva maçları listelendi.', { maclar: matches });
    } catch (error) {
        console.error(`Turnuva maçları listeleme hatası (ID: ${tournamentId}):`, error);
        return Response.internalServerError(res, 'Turnuva maçları listelenirken bir hata oluştu.');
    }
};

/**
 * Maç detaylarını getirir
 */
exports.getMatchById = async (req, res) => {
    const { matchId } = req.params;

    try {
        const match = await prisma.tournamentMatch.findUnique({
            where: { id: matchId },
            include: {
                tournament: {
                    select: {
                        id: true,
                        name: true,
                        gameId: true,
                        game: { select: { id: true, name: true, iconUrl: true } },
                        organizerId: true,
                        organizer: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } }
                    }
                },
                player1: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
                player2: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
                winner: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
                previousMatch1: true,
                previousMatch2: true,
                nextMatch: true
            }
        });

        if (!match) {
            return Response.notFound(res, 'Maç bulunamadı.');
        }

        return Response.ok(res, 'Maç detayları getirildi.', { mac: match });
    } catch (error) {
        console.error(`Maç detayları getirme hatası (ID: ${matchId}):`, error);
        return Response.internalServerError(res, 'Maç detayları getirilirken bir hata oluştu.');
    }
};

/**
 * Kullanıcının maçlarını listeler
 */
exports.getUserMatches = async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.userId;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
        // Filtreleme koşullarını oluştur
        const whereConditions = {
            OR: [
                { player1Id: userId },
                { player2Id: userId }
            ]
        };
        if (status) whereConditions.status = status.toUpperCase();

        const matches = await prisma.tournamentMatch.findMany({
            where: whereConditions,
            skip,
            take: parseInt(limit),
            orderBy: { scheduledTime: 'desc' },
            include: {
                tournament: {
                    select: {
                        id: true,
                        name: true,
                        gameId: true,
                        game: { select: { id: true, name: true, iconUrl: true } }
                    }
                },
                player1: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
                player2: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
                winner: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } }
            }
        });

        const totalMatches = await prisma.tournamentMatch.count({
            where: whereConditions
        });

        return Response.ok(res, 'Kullanıcı maçları listelendi.', {
            maclar: matches,
            meta: {
                toplamMac: totalMatches,
                suankiSayfa: parseInt(page),
                toplamSayfa: Math.ceil(totalMatches / parseInt(limit))
            }
        });
    } catch (error) {
        console.error(`Kullanıcı maçları listeleme hatası (UserID: ${userId}):`, error);
        return Response.internalServerError(res, 'Kullanıcı maçları listelenirken bir hata oluştu.');
    }
};

/**
 * Maç sonucu bildirir (oyuncu tarafından)
 */
exports.reportMatchResult = async (req, res) => {
    const { matchId } = req.params;
    const { score, opponentScore, evidence } = req.body;
    const userId = req.user.userId;

    try {
        const match = await prisma.tournamentMatch.findUnique({
            where: { id: matchId },
            include: {
                tournament: true
            }
        });

        if (!match) {
            return Response.notFound(res, 'Maç bulunamadı.');
        }

        // Kullanıcının maçın oyuncusu olup olmadığını kontrol et
        if (match.player1Id !== userId && match.player2Id !== userId) {
            return Response.forbidden(res, 'Bu maçın sonucunu bildirme yetkiniz yok.');
        }

        // Maç durumunu kontrol et
        if (match.status !== 'SCHEDULED') {
            return Response.badRequest(res, 'Bu maç için sonuç bildirimi yapılamaz.');
        }

        // Skor kontrolü
        if (!score || !opponentScore || score < 0 || opponentScore < 0) {
            return Response.badRequest(res, 'Geçerli skor değerleri giriniz.');
        }

        // Kullanıcının hangi oyuncu olduğunu belirle
        const isPlayer1 = match.player1Id === userId;
        
        // Maç sonucu bildirimini kaydet
        await prisma.matchResultReport.create({
            data: {
                matchId,
                reporterId: userId,
                player1Score: isPlayer1 ? score : opponentScore,
                player2Score: isPlayer1 ? opponentScore : score,
                evidence,
                status: 'PENDING'
            }
        });

        // Diğer oyuncunun da sonuç bildirip bildirmediğini kontrol et
        const otherPlayerId = isPlayer1 ? match.player2Id : match.player1Id;
        const otherPlayerReport = await prisma.matchResultReport.findFirst({
            where: {
                matchId,
                reporterId: otherPlayerId,
                status: 'PENDING'
            }
        });

        // Eğer diğer oyuncu da sonuç bildirdiyse ve sonuçlar uyuşuyorsa
        if (otherPlayerReport) {
            const player1ReportedScore = isPlayer1 ? score : otherPlayerReport.player1Score;
            const player2ReportedScore = isPlayer1 ? otherPlayerReport.player2Score : score;
            
            // Sonuçlar uyuşuyor mu kontrol et
            if (isPlayer1 && score === otherPlayerReport.player1Score && opponentScore === otherPlayerReport.player2Score ||
                !isPlayer1 && score === otherPlayerReport.player2Score && opponentScore === otherPlayerReport.player1Score) {
                
                // Sonuçlar uyuşuyor, maçı güncelle
                const winnerId = player1ReportedScore > player2ReportedScore ? match.player1Id : 
                                player2ReportedScore > player1ReportedScore ? match.player2Id : null;
                
                if (!winnerId) {
                    return Response.badRequest(res, 'Beraberlik durumu geçerli değil. Bir kazanan belirlenmelidir.');
                }
                
                // Maçı güncelle
                await prisma.tournamentMatch.update({
                    where: { id: matchId },
                    data: {
                        player1Score: player1ReportedScore,
                        player2Score: player2ReportedScore,
                        winnerId,
                        status: 'COMPLETED',
                        completedTime: new Date()
                    }
                });
                
                // Bildirimleri onayla
                await prisma.matchResultReport.updateMany({
                    where: { matchId },
                    data: { status: 'APPROVED' }
                });
                
                // Bir sonraki maçı güncelle (eğer varsa)
                if (match.nextMatchId) {
                    const isFirstPlayer = match.matchNumber % 2 === 1;
                    
                    await prisma.tournamentMatch.update({
                        where: { id: match.nextMatchId },
                        data: isFirstPlayer ? { player1Id: winnerId } : { player2Id: winnerId }
                    });
                }
                
                // Turnuvanın son maçı mı kontrol et
                if (match.round === 1 && match.matchNumber === 1) {
                    // Final maçı tamamlandı, turnuvayı güncelle
                    await prisma.tournament.update({
                        where: { id: match.tournamentId },
                        data: { status: 'COMPLETED', endDate: new Date() }
                    });
                    
                    // Kazanan için ödül ver (eğer ödül havuzu varsa)
                    if (match.tournament.prizePool > 0) {
                        await prisma.$transaction([
                            prisma.user.update({
                                where: { id: winnerId },
                                data: { diamonds: { increment: match.tournament.prizePool } }
                            }),
                            prisma.transaction.create({
                                data: {
                                    userId: winnerId,
                                    transactionType: 'TOURNAMENT_PRIZE',
                                    amount: match.tournament.prizePool,
                                    currency: 'DIAMOND',
                                    relatedEntityId: match.tournamentId,
                                    relatedEntityType: 'TOURNAMENT',
                                    status: 'COMPLETED'
                                }
                            })
                        ]);
                    }
                    
                    // Kazananın sıralamasını güncelle
                    await prisma.tournamentParticipant.update({
                        where: { tournamentId_userId: { tournamentId: match.tournamentId, userId: winnerId } },
                        data: { rank: 1 }
                    });
                    
                    // İkincinin sıralamasını güncelle
                    const runnerId = winnerId === match.player1Id ? match.player2Id : match.player1Id;
                    await prisma.tournamentParticipant.update({
                        where: { tournamentId_userId: { tournamentId: match.tournamentId, userId: runnerId } },
                        data: { rank: 2 }
                    });
                }
                
                return Response.ok(res, 'Maç sonucu onaylandı ve kaydedildi.');
            } else {
                // Sonuçlar uyuşmuyor, anlaşmazlık durumu
                await prisma.matchResultReport.updateMany({
                    where: { matchId },
                    data: { status: 'DISPUTED' }
                });
                
                // Turnuva organizatörüne bildirim gönder
                // TODO: Bildirim gönderme işlemi
                
                return Response.ok(res, 'Maç sonucu bildirildi, ancak rakibinizin bildirdiği sonuçla uyuşmazlık var. Organizatör incelemesi gerekiyor.');
            }
        }
        
        return Response.ok(res, 'Maç sonucu başarıyla bildirildi. Rakibinizin de sonuç bildirmesi bekleniyor.');
    } catch (error) {
        console.error(`Maç sonucu bildirme hatası (ID: ${matchId}):`, error);
        return Response.internalServerError(res, 'Maç sonucu bildirilirken bir hata oluştu.');
    }
};

/**
 * Anlaşmazlık durumundaki maç sonucunu çözer (organizatör veya admin tarafından)
 */
exports.resolveMatchDispute = async (req, res) => {
    const { matchId } = req.params;
    const { player1Score, player2Score, notes } = req.body;
    const userId = req.user.userId;

    try {
        const match = await prisma.tournamentMatch.findUnique({
            where: { id: matchId },
            include: {
                tournament: true,
                nextMatch: true
            }
        });

        if (!match) {
            return Response.notFound(res, 'Maç bulunamadı.');
        }

        // Yetki kontrolü
        if (match.tournament.organizerId !== userId && req.user.role !== 'ADMIN') {
            return Response.forbidden(res, 'Bu işlem için yetkiniz yok.');
        }

        // Anlaşmazlık durumunu kontrol et
        const disputedReports = await prisma.matchResultReport.findMany({
            where: {
                matchId,
                status: 'DISPUTED'
            }
        });

        if (disputedReports.length === 0) {
            return Response.badRequest(res, 'Bu maç için çözülmesi gereken bir anlaşmazlık bulunmuyor.');
        }

        // Skor kontrolü
        if (player1Score < 0 || player2Score < 0) {
            return Response.badRequest(res, 'Geçerli skor değerleri giriniz.');
        }

        if (player1Score === player2Score) {
            return Response.badRequest(res, 'Beraberlik durumu geçerli değil. Bir kazanan belirlenmelidir.');
        }

        // Kazananı belirle
        const winnerId = player1Score > player2Score ? match.player1Id : match.player2Id;

        // Maçı güncelle
        const updatedMatch = await prisma.tournamentMatch.update({
            where: { id: matchId },
            data: {
                player1Score: parseInt(player1Score),
                player2Score: parseInt(player2Score),
                winnerId,
                status: 'COMPLETED',
                completedTime: new Date(),
                adminNotes: notes
            }
        });

        // Bildirimleri güncelle
        await prisma.matchResultReport.updateMany({
            where: { matchId },
            data: { status: 'RESOLVED' }
        });

        // Bir sonraki maçı güncelle (eğer varsa)
        if (match.nextMatchId) {
            const isFirstPlayer = match.matchNumber % 2 === 1;
            
            await prisma.tournamentMatch.update({
                where: { id: match.nextMatchId },
                data: isFirstPlayer ? { player1Id: winnerId } : { player2Id: winnerId }
            });
        }

        // Turnuvanın son maçı mı kontrol et
        if (match.round === 1 && match.matchNumber === 1) {
            // Final maçı tamamlandı, turnuvayı güncelle
            await prisma.tournament.update({
                where: { id: match.tournamentId },
                data: { status: 'COMPLETED', endDate: new Date() }
            });

            // Kazanan için ödül ver (eğer ödül havuzu varsa)
            if (match.tournament.prizePool > 0) {
                await prisma.$transaction([
                    prisma.user.update({
                        where: { id: winnerId },
                        data: { diamonds: { increment: match.tournament.prizePool } }
                    }),
                    prisma.transaction.create({
                        data: {
                            userId: winnerId,
                            transactionType: 'TOURNAMENT_PRIZE',
                            amount: match.tournament.prizePool,
                            currency: 'DIAMOND',
                            relatedEntityId: match.tournamentId,
                            relatedEntityType: 'TOURNAMENT',
                            status: 'COMPLETED'
                        }
                    })
                ]);
            }

            // Kazananın sıralamasını güncelle
            await prisma.tournamentParticipant.update({
                where: { tournamentId_userId: { tournamentId: match.tournamentId, userId: winnerId } },
                data: { rank: 1 }
            });

            // İkincinin sıralamasını güncelle
            const runnerId = winnerId === match.player1Id ? match.player2Id : match.player1Id;
            await prisma.tournamentParticipant.update({
                where: { tournamentId_userId: { tournamentId: match.tournamentId, userId: runnerId } },
                data: { rank: 2 }
            });
        }

        // Oyunculara bildirim gönder
        // TODO: Bildirim gönderme işlemi

        return Response.ok(res, 'Maç anlaşmazlığı başarıyla çözüldü.', { mac: updatedMatch });
    } catch (error) {
        console.error(`Maç anlaşmazlığı çözme hatası (ID: ${matchId}):`, error);
        return Response.internalServerError(res, 'Maç anlaşmazlığı çözülürken bir hata oluştu.');
    }
};