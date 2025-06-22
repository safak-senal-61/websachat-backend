// src/controllers/gift/gift_history_controller.js
const { PrismaClient, TransactionType } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

const getGiftHistory = async (req, res, transactionType) => {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId, transactionType },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit),
            // Hediye detaylarını ve alıcı/gönderici bilgisini de getirmek için include eklenebilir.
        });
        const totalTransactions = await prisma.transaction.count({
            where: { userId, transactionType }
        });
        
        const message = transactionType === TransactionType.GIFT_SEND
            ? "Gönderdiğiniz hediyeler listelendi."
            : "Aldığınız hediyeler listelendi.";

        return Response.ok(res, message, {
            islemler: transactions,
            meta: { toplamIslem: totalTransactions, suankiSayfa: parseInt(page), toplamSayfa: Math.ceil(totalTransactions / limit) }
        });
    } catch (error) {
        console.error(`${transactionType} geçmişi hatası:`, error);
        return Response.internalServerError(res, "Hediye geçmişi alınırken bir hata oluştu.");
    }
};

exports.getMySentGifts = (req, res) => {
    return getGiftHistory(req, res, TransactionType.GIFT_SEND);
};

exports.getMyReceivedGifts = (req, res) => {
    return getGiftHistory(req, res, TransactionType.GIFT_RECEIVE);
};
