// src/controllers/tournament/tournament_controller.js
const { PrismaClient, TournamentStatus, TournamentFormat } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

/**
 * Yeni bir turnuva oluşturur
 */
exports.createTournament = async (req, res) => {
    const { gameId, name, description, format, startDate, endDate, registrationStart, registrationEnd, 
            maxParticipants, entryFee, prizePool, rules, coverImageUrl } = req.body;
    const organizerId = req.user.userId;

    if (!gameId || !name || !format || !startDate || !registrationStart || !registrationEnd || !maxParticipants) {
        return Response.badRequest(res, 'Turnuva oluşturmak için gerekli alanları doldurunuz.');
    }

    try {
        // Oyunun var olup olmadığını kontrol et
        const game = await prisma.game.findUnique({ where: { id: gameId } });
        if (!game) {
            return Response.notFound(res, 'Belirtilen oyun bulunamadı.');
        }

        // Format enum değerini kontrol et
        const tournamentFormat = TournamentFormat[format.toUpperCase()];
        if (!tournamentFormat) {
            return Response.badRequest(res, 'Geçersiz turnuva formatı.');
        }

        // Tarihleri kontrol et
        const now = new Date();
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = endDate ? new Date(endDate) : null;
        const parsedRegStart = new Date(registrationStart);
        const parsedRegEnd = new Date(registrationEnd);

        if (parsedRegStart > parsedRegEnd || parsedRegEnd > parsedStartDate) {
            return Response.badRequest(res, 'Geçersiz tarih aralıkları. Kayıt başlangıcı < Kayıt bitişi < Turnuva başlangıcı olmalıdır.');
        }

        // Turnuvayı oluştur
        const newTournament = await prisma.tournament.create({
            data: {
                gameId,
                name,
                description,
                organizerId,
                format: tournamentFormat,
                startDate: parsedStartDate,
                endDate: parsedEndDate,
                registrationStart: parsedRegStart,
                registrationEnd: parsedRegEnd,
                maxParticipants: parseInt(maxParticipants, 10),
                entryFee: entryFee ? BigInt(entryFee) : BigInt(0),
                prizePool: prizePool ? BigInt(prizePool) : BigInt(0),
                rules,
                coverImageUrl,
                status: TournamentStatus.UPCOMING
            },
            include: {
                game: { select: { id: true, name: true, iconUrl: true } },
                organizer: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } }
            }
        });

        return Response.created(res, 'Turnuva başarıyla oluşturuldu.', { turnuva: newTournament });
    } catch (error) {
        console.error('Turnuva oluşturma hatası:', error);
        return Response.internalServerError(res, 'Turnuva oluşturulurken bir hata oluştu.');
    }
};

/**
 * Turnuvaları listeler
 */
exports.listTournaments = async (req, res) => {
    const { page = 1, limit = 10, gameId, status, format } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const whereConditions = {};
    if (gameId) whereConditions.gameId = gameId;
    if (status) whereConditions.status = status.toUpperCase();
    if (format) whereConditions.format = format.toUpperCase();

    try {
        const tournaments = await prisma.tournament.findMany({
            where: whereConditions,
            orderBy: { startDate: 'asc' },
            skip,
            take: parseInt(limit),
            include: {
                game: { select: { id: true, name: true, iconUrl: true } },
                organizer: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
                _count: { select: { participants: true } }
            }
        });

        const totalTournaments = await prisma.tournament.count({ where: whereConditions });

        return Response.ok(res, 'Turnuvalar listelendi.', {
            turnuvalar: tournaments,
            meta: {
                toplamTurnuva: totalTournaments,
                suankiSayfa: parseInt(page),
                toplamSayfa: Math.ceil(totalTournaments / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Turnuvaları listeleme hatası:', error);
        return Response.internalServerError(res, 'Turnuvalar listelenirken bir hata oluştu.');
    }
};

/**
 * Turnuva detaylarını getirir
 */
exports.getTournamentById = async (req, res) => {
    const { tournamentId } = req.params;

    try {
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            include: {
                game: true,
                organizer: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
                participants: {
                    include: {
                        user: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } }
                    }
                },
                matches: {
                    include: {
                        player1: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
                        player2: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
                        winner: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } }
                    },
                    orderBy: { round: 'asc' }
                }
            }
        });

        if (!tournament) {
            return Response.notFound(res, 'Turnuva bulunamadı.');
        }

        return Response.ok(res, 'Turnuva detayları getirildi.', { turnuva: tournament });
    } catch (error) {
        console.error(`Turnuva getirme hatası (ID: ${tournamentId}):`, error);
        return Response.internalServerError(res, 'Turnuva detayları getirilirken bir hata oluştu.');
    }
};

/**
 * Turnuvaya kayıt olma
 */
exports.registerForTournament = async (req, res) => {
    const { tournamentId } = req.params;
    const userId = req.user.userId;

    try {
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            include: { _count: { select: { participants: true } } }
        });

        if (!tournament) {
            return Response.notFound(res, 'Turnuva bulunamadı.');
        }

        // Turnuva durumunu kontrol et
        if (tournament.status !== TournamentStatus.REGISTRATION_OPEN) {
            return Response.badRequest(res, 'Bu turnuva için kayıtlar şu anda açık değil.');
        }

        // Katılımcı sayısını kontrol et
        if (tournament._count.participants >= tournament.maxParticipants) {
            return Response.badRequest(res, 'Turnuva maksimum katılımcı sayısına ulaştı.');
        }

        // Kullanıcının daha önce kaydolup olmadığını kontrol et
        const existingRegistration = await prisma.tournamentParticipant.findUnique({
            where: { tournamentId_userId: { tournamentId, userId } }
        });

        if (existingRegistration) {
            return Response.badRequest(res, 'Bu turnuvaya zaten kayıtlısınız.');
        }

        // Giriş ücreti kontrolü
        if (tournament.entryFee > 0) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { coins: true }
            });

            if (user.coins < tournament.entryFee) {
                return Response.paymentRequired(res, `Turnuvaya katılmak için yeterli jetonunuz yok. Gerekli: ${tournament.entryFee.toString()}, Mevcut: ${user.coins.toString()}`);
            }

            // Jeton düşme ve işlem kaydı oluşturma işlemleri transaction içinde yapılmalı
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: userId },
                    data: { coins: { decrement: tournament.entryFee } }
                }),
                prisma.transaction.create({
                    data: {
                        userId,
                        transactionType: 'TOURNAMENT_ENTRY',
                        amount: tournament.entryFee,
                        currency: 'COIN',
                        relatedEntityId: tournamentId,
                        relatedEntityType: 'TOURNAMENT',
                        status: 'COMPLETED'
                    }
                })
            ]);
        }

        // Turnuvaya kayıt ol
        const registration = await prisma.tournamentParticipant.create({
            data: {
                tournamentId,
                userId
            },
            include: {
                user: { select: { id: true, username: true, nickname: true, profilePictureUrl: true } },
                tournament: { select: { id: true, name: true, startDate: true } }
            }
        });

        // Katılımcı sayısını güncelle
        await prisma.tournament.update({
            where: { id: tournamentId },
            data: { currentParticipants: { increment: 1 } }
        });

        return Response.created(res, 'Turnuvaya başarıyla kaydoldunuz.', { kayit: registration });
    } catch (error) {
        console.error(`Turnuva kayıt hatası (ID: ${tournamentId}):`, error);
        return Response.internalServerError(res, 'Turnuvaya kaydolurken bir hata oluştu.');
    }
};

/**
 * Turnuva eşleşmelerini oluşturur (Organizatör veya Admin için)
 */
exports.generateTournamentMatches = async (req, res) => {
    const { tournamentId } = req.params;
    const userId = req.user.userId;

    try {
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            include: { participants: true }
        });

        if (!tournament) {
            return Response.notFound(res, 'Turnuva bulunamadı.');
        }

        // Yetki kontrolü
        if (tournament.organizerId !== userId && req.user.role !== 'ADMIN') {
            return Response.forbidden(res, 'Bu işlem için yetkiniz yok.');
        }

        // Turnuva durumunu kontrol et
        if (tournament.status !== TournamentStatus.REGISTRATION_CLOSED) {
            return Response.badRequest(res, 'Turnuva eşleşmeleri oluşturmak için kayıtlar kapatılmalıdır.');
        }

        // Katılımcı sayısını kontrol et
        if (tournament.participants.length < 2) {
            return Response.badRequest(res, 'Turnuva eşleşmeleri oluşturmak için en az 2 katılımcı gereklidir.');
        }

        // Mevcut eşleşmeleri kontrol et
        const existingMatches = await prisma.tournamentMatch.count({
            where: { tournamentId }
        });

        if (existingMatches > 0) {
            return Response.badRequest(res, 'Bu turnuva için eşleşmeler zaten oluşturulmuş.');
        }

        // Katılımcıları karıştır
        const shuffledParticipants = tournament.participants.sort(() => 0.5 - Math.random());
        
        // Eşleşmeleri oluştur (Tek eleme turnuvası örneği)
        const matches = [];
        const participantCount = shuffledParticipants.length;
        const rounds = Math.ceil(Math.log2(participantCount));
        const totalMatches = Math.pow(2, rounds) - 1;
        const firstRoundMatches = Math.pow(2, rounds - 1);
        const byes = Math.pow(2, rounds) - participantCount;

        // İlk tur eşleşmelerini oluştur
        for (let i = 0; i < firstRoundMatches; i++) {
            const player1Index = i;
            const player2Index = participantCount - 1 - i;
            
            // Eğer bye varsa, son eşleşmelerden başlayarak bye ver
            const hasPlayer1 = player1Index < participantCount;
            const hasPlayer2 = player2Index >= 0 && player2Index < participantCount && player1Index !== player2Index;
            
            matches.push({
                tournamentId,
                round: 1,
                matchNumber: i + 1,
                player1Id: hasPlayer1 ? shuffledParticipants[player1Index].userId : null,
                player2Id: hasPlayer2 ? shuffledParticipants[player2Index].userId : null,
                status: hasPlayer1 && hasPlayer2 ? 'SCHEDULED' : 'COMPLETED',
                // Eğer bir oyuncu bye aldıysa, diğer oyuncu otomatik olarak kazanır
                winnerId: !hasPlayer2 && hasPlayer1 ? shuffledParticipants[player1Index].userId : 
                          !hasPlayer1 && hasPlayer2 ? shuffledParticipants[player2Index].userId : null,
                scheduledTime: new Date(tournament.startDate)
            });
        }

        // Sonraki turlar için boş eşleşmeler oluştur
        let matchCounter = firstRoundMatches + 1;
        for (let round = 2; round <= rounds; round++) {
            const matchesInRound = Math.pow(2, rounds - round);
            for (let i = 0; i < matchesInRound; i++) {
                matches.push({
                    tournamentId,
                    round,
                    matchNumber: i + 1,
                    player1Id: null,
                    player2Id: null,
                    status: 'SCHEDULED',
                    scheduledTime: new Date(tournament.startDate.getTime() + (round - 1) * 24 * 60 * 60 * 1000) // Her tur için +1 gün
                });
                matchCounter++;
            }
        }

        // Eşleşmeleri veritabanına kaydet
        await prisma.tournamentMatch.createMany({
            data: matches
        });

        // Turnuva durumunu güncelle
        await prisma.tournament.update({
            where: { id: tournamentId },
            data: { status: TournamentStatus.IN_PROGRESS }
        });

        return Response.ok(res, 'Turnuva eşleşmeleri başarıyla oluşturuldu.', {
            eslesmeAdedi: matches.length,
            turSayisi: rounds
        });
    } catch (error) {
        console.error(`Turnuva eşleşme oluşturma hatası (ID: ${tournamentId}):`, error);
        return Response.internalServerError(res, 'Turnuva eşleşmeleri oluşturulurken bir hata oluştu.');
    }
};

/**
 * Maç sonucunu günceller
 */
exports.updateMatchResult = async (req, res) => {
    const { matchId } = req.params;
    const { player1Score, player2Score } = req.body;
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

        // Maç durumunu kontrol et
        if (match.status === 'COMPLETED') {
            return Response.badRequest(res, 'Bu maç zaten tamamlanmış.');
        }

        // Oyuncuları kontrol et
        if (!match.player1Id || !match.player2Id) {
            return Response.badRequest(res, 'Bu maç için henüz tüm oyuncular belirlenmemiş.');
        }

        // Kazananı belirle
        let winnerId = null;
        if (player1Score > player2Score) {
            winnerId = match.player1Id;
        } else if (player2Score > player1Score) {
            winnerId = match.player2Id;
        } else {
            return Response.badRequest(res, 'Beraberlik durumu geçerli değil. Bir kazanan belirlenmelidir.');
        }

        // Maçı güncelle
        const updatedMatch = await prisma.tournamentMatch.update({
            where: { id: matchId },
            data: {
                player1Score: parseInt(player1Score),
                player2Score: parseInt(player2Score),
                winnerId,
                status: 'COMPLETED',
                completedTime: new Date()
            }
        });

        // Bir sonraki maçı güncelle (eğer varsa)
        if (match.nextMatchId) {
            const nextMatch = match.nextMatch;
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
                data: { status: TournamentStatus.COMPLETED, endDate: new Date() }
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

        return Response.ok(res, 'Maç sonucu başarıyla güncellendi.', { mac: updatedMatch });
    } catch (error) {
        console.error(`Maç sonucu güncelleme hatası (ID: ${matchId}):`, error);
        return Response.internalServerError(res, 'Maç sonucu güncellenirken bir hata oluştu.');
    }
};