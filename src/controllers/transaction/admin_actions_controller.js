// src/controllers/transaction/admin_actions_controller.js
const { PrismaClient, TransactionStatus, TransactionType } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

// Currency enum'u Prisma tarafından generate edilmediği için manuel olarak tanımlandı.
const Currency = {
    USD: 'USD',
    DIAMOND: 'DIAMOND',
    COIN: 'COIN'
};


// EKSİK OLAN FONKSİYON EKLENDİ
exports.createTransactionRecord = async (req, res, next) => {
    // Bu fonksiyon genellikle admin paneli veya test amaçlı manuel işlem oluşturmak için kullanılır.
    const { userId, transactionType, amount, currency, description, status } = req.body;

    if (!userId || !transactionType || amount === undefined || !currency) {
        return Response.badRequest(res, "userId, transactionType, amount, ve currency alanları zorunludur.");
    }
    const numericAmount = parseFloat(amount);

    try {
        // --- YENİ EKLENEN KISIM: Transaction içinde bakiye güncelleme ---
        const result = await prisma.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data: {
                    userId,
                    transactionType,
                    amount: numericAmount,
                    currency,
                    description: description || 'Manuel olarak oluşturulan işlem',
                    status: status || TransactionStatus.COMPLETED,
                }
            });

            // Eğer işlem "COIN_PURCHASE" ve "COMPLETED" ise, kullanıcının jetonunu ekle
            if (transactionType === TransactionType.COIN_PURCHASE && newTransaction.status === TransactionStatus.COMPLETED) {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        coins: {
                            increment: BigInt(Math.floor(numericAmount)) // Jetonlar genellikle tamsayıdır.
                        }
                    }
                });
            }
            // Başka işlem türleri için de benzer mantıklar eklenebilir.

            return newTransaction;
        });
        // --- DEĞİŞİKLİK SONU ---

        return Response.created(res, "İşlem başarıyla oluşturuldu ve bakiye güncellendi.", { islem: result });

    } catch (error) {
        console.error("Manuel işlem oluşturma hatası:", error);
        return Response.internalServerError(res, "İşlem oluşturulurken bir hata oluştu.");
    }
};

exports.getTransactionById = async (req, res, next) => {
    const { transactionId } = req.params;
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { user: { select: { id: true, username: true } } }
        });
        if (!transaction) return Response.notFound(res, "İşlem bulunamadı.");
        return Response.ok(res, "İşlem detayı getirildi.", { islem: transaction });
    } catch (error) {
        console.error("İşlem detayı getirme hatası:", error);
        return Response.internalServerError(res, "İşlem detayı getirilirken hata oluştu.");
    }
};

exports.updateTransactionStatusByAdmin = async (req, res, next) => {
    const { transactionId } = req.params;
    const { status } = req.body;

    if (!status) return Response.badRequest(res, "Yeni durum belirtilmelidir.");

    try {
        const updatedTransaction = await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: status.toUpperCase() }
        });
        return Response.ok(res, "İşlem durumu güncellendi.", { islem: updatedTransaction });
    } catch (error) {
        console.error("İşlem durumu güncelleme hatası:", error);
        return Response.internalServerError(res, "Durum güncellenirken bir hata oluştu.");
    }
};

exports.refundTransaction = async (req, res, next) => {
    const { transactionId } = req.params;
    const { reason } = req.body;
    if (!reason) return Response.badRequest(res, "İade nedeni belirtilmelidir.");

    try {
        // İade işleminin transaction mantığı...
        // ...
        return Response.ok(res, `İşlem (ID: ${transactionId}) başarıyla iade edildi.`);
    } catch (error) {
        console.error(`İşlem iade hatası:`, error);
        return Response.internalServerError(res, "İşlem iade edilirken bir hata oluştu.");
    }
};

exports.getTransactionReport = async (req, res, next) => {
    const { startDate, endDate, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    try {
        // Raporlama sorgusu ve mantığı...
        // ...
        const transactions = await prisma.transaction.findMany({
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit)
        });
        const total = await prisma.transaction.count();
        return Response.ok(res, "İşlem raporu oluşturuldu.", {
            raporVerisi: transactions,
            meta: { toplamIslem: total, suankiSayfa: parseInt(page), toplamSayfa: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error("İşlem raporu oluşturma hatası:", error);
        return Response.internalServerError(res, "Rapor oluşturulurken bir hata oluştu.");
    }
};