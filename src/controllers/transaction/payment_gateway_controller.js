// src/controllers/transaction/payment_gateway_controller.js

const { PrismaClient, TransactionType, TransactionStatus } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const iyzico = require('../../services/iyzico_service');
const Iyzipay = require('iyzipay');

const Currency = {
    USD: 'USD',
    TRY: 'TRY',
    DIAMOND: 'DIAMOND',
    COIN: 'COIN'
};

const coinPackages = {
    'PKG15': { id: 'PKG15', name: 'Deneme Paketi', price: '15.00', coins: 50, bonusCoins: 5 },
    'PKG25': { id: 'PKG25', name: 'Başlangıç Paketi', price: '25.00', coins: 100, bonusCoins: 10 },
    'PKG50': { id: 'PKG50', name: 'Popüler Paket', price: '50.00', coins: 250, bonusCoins: 50 },
    'PKG95': { id: 'PKG95', name: 'Fenomen Paketi', price: '95.00', coins: 500, bonusCoins: 100 },
    'PKG180': { id: 'PKG180', name: 'VIP Paketi', price: '180.00', coins: 1000, bonusCoins: 250 },
    'PKG400': { id: 'PKG400', name: 'Premium Paket', price: '400.00', coins: 2500, bonusCoins: 750 },
    'PKG750': { id: 'PKG750', name: 'Elite Paketi', price: '750.00', coins: 5000, bonusCoins: 2000 },
    'PKG1400': { id: 'PKG1400', name: 'İmparator Paketi', price: '1400.00', coins: 10000, bonusCoins: 5000 },
};

/**
 * Iyzico ödeme formunu başlatır ve Iyzico'dan dönen token'ı DB'ye kaydeder.
 */
exports.initiateCoinPurchase = async (req, res) => {
    const { coinPackageId } = req.body;
    const userId = req.user.userId;

    const selectedPackage = coinPackages[coinPackageId];
    if (!selectedPackage) {
        return Response.badRequest(res, "Geçerli bir jeton paketi seçilmelidir.");
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return Response.notFound(res, "Kullanıcı bulunamadı.");

        const pendingTransaction = await prisma.transaction.create({
            data: {
                userId,
                transactionType: TransactionType.COIN_PURCHASE,
                amount: parseFloat(selectedPackage.price),
                currency: Currency.TRY,
                relatedEntityId: coinPackageId,
                relatedEntityType: 'COIN_PACKAGE',
                status: TransactionStatus.PENDING,
                platform: 'IYZICO',
            }
        });

        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: pendingTransaction.id,
            price: selectedPackage.price,
            paidPrice: selectedPackage.price,
            currency: Iyzipay.CURRENCY.TRY,
            basketId: pendingTransaction.id,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            callbackUrl: `${process.env.BASE_URL}/transactions/callback/iyzico`,
            buyer: { id: user.id, name: user.nickname || user.username, surname: 'User', gsmNumber: '+905555555555', email: user.email, identityNumber: '11111111111', lastLoginDate: new Date(user.lastLoginAt || Date.now()).toISOString().replace(/T/, ' ').replace(/\..+/, ''), registrationDate: new Date(user.createdAt).toISOString().replace(/T/, ' ').replace(/\..+/, ''), registrationAddress: 'N/A', ip: req.ip, city: 'N/A', country: user.country || 'Turkey', zipCode: '34000' },
            shippingAddress: { contactName: user.nickname || user.username, city: 'N/A', country: 'Turkey', address: 'N/A', zipCode: '34000' },
            billingAddress: { contactName: user.nickname || user.username, city: 'N/A', country: 'Turkey', address: 'N/A', zipCode: '34000' },
            basketItems: [{ id: selectedPackage.id, name: selectedPackage.name, category1: 'Digital Goods', itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL, price: selectedPackage.price }]
        };

        iyzico.checkoutFormInitialize.create(request, async (err, result) => {
            if (err) {
                console.error("Iyzico ödeme formu oluşturma hatası:", err);
                return Response.internalServerError(res, "Ödeme formu oluşturulamadı.", err);
            }
            if (result.status === 'success' && result.token) {
                // ================== GÜNCELLEME 1: IYZICO TOKEN'INI DB'YE KAYDET ==================
                try {
                    await prisma.transaction.update({
                        where: { id: pendingTransaction.id },
                        data: { paymentGatewayToken: result.token }
                    });
                    console.log(`[iyzico] Iyzico token (${result.token}) Transaction (${pendingTransaction.id}) kaydına eklendi.`);
                } catch (dbError) {
                    console.error("Iyzico token'ı veritabanına kaydederken hata:", dbError);
                    return Response.internalServerError(res, "Ödeme oturumu başlatılamadı.");
                }
                // ================== GÜNCELLEME SONU ==================

                return Response.ok(res, "Ödeme formu başarıyla oluşturuldu.", {
                    paymentPageContent: result.checkoutFormContent
                });
            } else {
                return Response.badRequest(res, `Iyzico Hatası: ${result.errorMessage}`, {
                    errorCode: result.errorCode,
                });
            }
        });
    } catch (error) {
        console.error("Jeton satın alma başlatma hatası:", error);
        return Response.internalServerError(res, "Satın alma işlemi başlatılırken hata oluştu.");
    }
};

/**
 * Iyzico'dan gelen callback'i işler, ödemeyi doğrular ve işlemi tamamlar.
 */
exports.handleIyzicoCallback = async (req, res) => {
    console.log("--- IYZICO CALLBACK ALINDI ---");
    console.log("Request Body:", req.body);

    const token = req.body.token;
    if (!token) {
        console.warn("Iyzico callback'i 'token' olmadan geldi.");
        return res.redirect(`${process.env.CLIENT_URL}/payment/failed?reason=invalid_callback_parameters`);
    }

    try {
        // ================== GÜNCELLEME 2: TOKEN İLE TRANSACTION'I BUL ==================
        const transaction = await prisma.transaction.findUnique({
            where: { paymentGatewayToken: token }
        });

        if (!transaction) {
            console.error(`Iyzico callback'i için geçersiz token: ${token}. Veritabanında eşleşme bulunamadı.`);
            return res.redirect(`${process.env.CLIENT_URL}/payment/failed?reason=transaction_not_found`);
        }
        
        const conversationId = transaction.id;
        // ================== GÜNCELLEME SONU ==================

        iyzico.checkoutForm.retrieve({
            locale: Iyzipay.LOCALE.TR,
            conversationId: conversationId,
            token: token,
        }, async (err, result) => {
            if (err || result.status !== 'success' || result.paymentStatus !== 'SUCCESS') {
                console.error(`Iyzico doğrulama hatası (conversationId: ${conversationId}):`, err || result.errorMessage);
                await prisma.transaction.update({
                    where: { id: conversationId },
                    data: { status: TransactionStatus.FAILED, description: err?.message || result?.errorMessage }
                }).catch(e => console.error("Başarısız işlem güncellenirken hata:", e));
                return res.redirect(`${process.env.CLIENT_URL}/payment/failed?reason=${result.errorCode || 'verification_failed'}`);
            }
            
            if (transaction.status !== TransactionStatus.PENDING) {
                console.warn(`Bu işlem daha önce işlenmiş olabilir: ${transaction.id}, Durum: ${transaction.status}`);
                // Kullanıcıyı zaten başarılı olduğuna dair bir sayfaya yönlendirebiliriz.
                return res.redirect(`${process.env.CLIENT_URL}/payment/success?already_processed=true`);
            }

            try {
                await prisma.$transaction(async (tx) => {
                    const selectedPackage = coinPackages[transaction.relatedEntityId];
                    if (!selectedPackage)  throw new Error(`Geçersiz paket ID'si: ${transaction.relatedEntityId}`);

                    await tx.transaction.update({
                        where: { id: transaction.id },
                        data: {
                            status: TransactionStatus.COMPLETED,
                            platformTransactionId: result.paymentId,
                        },
                    });

                    const totalCoinsToAdd = BigInt(selectedPackage.coins) + BigInt(selectedPackage.bonusCoins || 0);
                    await tx.user.update({
                        where: { id: transaction.userId },
                        data: { coins: { increment: totalCoinsToAdd } },
                    });
                });

                console.log(`Iyzico ödemesi başarıyla tamamlandı. Transaction ID: ${transaction.id}`);
                return res.redirect(`${process.env.CLIENT_URL}/payment/success`);

            } catch (dbError) {
                console.error(`Iyzico callback DB hatası (Transaction ID: ${transaction.id}):`, dbError);
                return res.redirect(`${process.env.CLIENT_URL}/payment/failed?reason=database_error`);
            }
        });
    } catch (error) {
        console.error("Iyzico callback genel hata:", error);
        return res.redirect(`${process.env.CLIENT_URL}/payment/failed?reason=internal_error`);
    }
};

exports.handlePaymentWebhook = async (req, res) => {
    console.warn("handlePaymentWebhook endpoint'i çağrıldı ancak bu senaryoda kullanılmıyor.");
    return Response.ok(res, "Webhook alındı.");
};