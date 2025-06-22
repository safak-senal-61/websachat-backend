// src/controllers/transaction/user_actions_controller.js
const { PrismaClient, TransactionType, TransactionStatus } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

// Currency enum'u Prisma tarafından generate edilmediği için manuel olarak tanımlandı.
const Currency = {
    USD: 'USD',
    DIAMOND: 'DIAMOND',
    COIN: 'COIN'
};

exports.getUserTransactions = async (req, res) => {
    const userId = req.user.userId;
    const { page = 1, limit = 20, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereConditions = { userId };
    if (type) {
        whereConditions.transactionType = type.toUpperCase();
    }

    try {
        const transactions = await prisma.transaction.findMany({
            where: whereConditions,
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit),
        });
        const total = await prisma.transaction.count({ where: whereConditions });

        return Response.ok(res, "İşlemleriniz listelendi.", {
            islemler: transactions,
            meta: { toplamIslem: total, suankiSayfa: parseInt(page), toplamSayfa: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        console.error("Kullanıcı işlemleri listeleme hatası:", error);
        return Response.internalServerError(res, "İşlemleriniz listelenirken bir hata oluştu.");
    }
};

exports.getUserBalance = async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { coins: true, diamonds: true }
        });
        if (!user) return Response.notFound(res, "Kullanıcı bulunamadı.");

        return Response.ok(res, "Bakiye bilgileri getirildi.", {
            bakiye: {
                jetonlar: user.coins.toString(),
                elmaslar: user.diamonds.toString()
            }
        });
    } catch (error) {
        console.error("Bakiye getirme hatası:", error);
        return Response.internalServerError(res, "Bakiye bilgileri getirilirken hata oluştu.");
    }
};

exports.convertDiamondsToCoins = async (req, res) => {
    const { diamondAmount } = req.body;
    const userId = req.user.userId;
    const numericDiamondAmount = parseInt(diamondAmount, 10);

    if (isNaN(numericDiamondAmount) || numericDiamondAmount <= 0) {
        return Response.badRequest(res, "Geçerli bir elmas miktarı girilmelidir.");
    }

    const CONVERSION_RATE = 10; // Örnek: 1 Elmas = 10 Jeton
    const coinAmountToReceive = BigInt(numericDiamondAmount * CONVERSION_RATE);

    try {
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user || user.diamonds < BigInt(numericDiamondAmount)) {
                throw new Error("Yetersiz elmas bakiyesi.");
            }
            await tx.user.update({
                where: { id: userId },
                data: { diamonds: { decrement: BigInt(numericDiamondAmount) } }
            });
            await tx.user.update({
                where: { id: userId },
                data: { coins: { increment: coinAmountToReceive } }
            });
            await tx.transaction.create({
                data: {
                    userId,
                    transactionType: TransactionType.DIAMOND_CONVERSION,
                    amount: numericDiamondAmount,
                    currency: Currency.DIAMOND,
                    status: TransactionStatus.COMPLETED
                }
            });
        });

        const updatedUser = await prisma.user.findUnique({where: {id: userId}, select: {coins: true, diamonds: true}});
        return Response.ok(res, "Dönüşüm işlemi başarılı.", {
            yeniBakiye: {
                jetonlar: updatedUser.coins.toString(),
                elmaslar: updatedUser.diamonds.toString()
            }
        });
    } catch (error) {
        console.error("Elmas-Jeton dönüşüm hatası:", error);
        return Response.badRequest(res, error.message);
    }
};