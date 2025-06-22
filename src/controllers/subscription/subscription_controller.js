// src/controllers/subscription/subscription_controller.js
const { PrismaClient, SubscriptionStatus } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');
const { iyzipay } = require('../../config/payment_config');

/**
 * Abonelik planlarını listeler
 */
exports.listSubscriptionPlans = async (req, res) => {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' }
        });

        return Response.ok(res, 'Abonelik planları listelendi.', { planlar: plans });
    } catch (error) {
        console.error('Abonelik planları listeleme hatası:', error);
        return Response.internalServerError(res, 'Abonelik planları listelenirken bir hata oluştu.');
    }
};

/**
 * Abonelik planı detaylarını getirir
 */
exports.getSubscriptionPlanById = async (req, res) => {
    const { planId } = req.params;

    try {
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return Response.notFound(res, 'Abonelik planı bulunamadı.');
        }

        return Response.ok(res, 'Abonelik planı detayları getirildi.', { plan });
    } catch (error) {
        console.error(`Abonelik planı getirme hatası (ID: ${planId}):`, error);
        return Response.internalServerError(res, 'Abonelik planı detayları getirilirken bir hata oluştu.');
    }
};

/**
 * Yeni abonelik planı oluşturur (Admin için)
 */
exports.createSubscriptionPlan = async (req, res) => {
    const { name, description, price, durationMonths, features, discountPercentage, isActive } = req.body;

    // Yetki kontrolü middleware ile yapılacak (checkRole(['ADMIN']))

    try {
        // Gerekli alanları kontrol et
        if (!name || !price || !durationMonths) {
            return Response.badRequest(res, 'Abonelik planı oluşturmak için gerekli alanları doldurunuz.');
        }

        // Abonelik planını oluştur
        const newPlan = await prisma.subscriptionPlan.create({
            data: {
                name,
                description,
                price: BigInt(price),
                durationMonths: parseInt(durationMonths),
                features: features || [],
                discountPercentage: discountPercentage ? parseInt(discountPercentage) : 0,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        return Response.created(res, 'Abonelik planı başarıyla oluşturuldu.', { plan: newPlan });
    } catch (error) {
        console.error('Abonelik planı oluşturma hatası:', error);
        return Response.internalServerError(res, 'Abonelik planı oluşturulurken bir hata oluştu.');
    }
};

/**
 * Abonelik planını günceller (Admin için)
 */
exports.updateSubscriptionPlan = async (req, res) => {
    const { planId } = req.params;
    const { name, description, price, durationMonths, features, discountPercentage, isActive } = req.body;

    // Yetki kontrolü middleware ile yapılacak (checkRole(['ADMIN']))

    try {
        // Planın var olup olmadığını kontrol et
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return Response.notFound(res, 'Abonelik planı bulunamadı.');
        }

        // Güncellenecek verileri hazırla
        const updateData = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price) updateData.price = BigInt(price);
        if (durationMonths) updateData.durationMonths = parseInt(durationMonths);
        if (features) updateData.features = features;
        if (discountPercentage !== undefined) updateData.discountPercentage = parseInt(discountPercentage);
        if (isActive !== undefined) updateData.isActive = isActive;

        // Planı güncelle
        const updatedPlan = await prisma.subscriptionPlan.update({
            where: { id: planId },
            data: updateData
        });

        return Response.ok(res, 'Abonelik planı başarıyla güncellendi.', { plan: updatedPlan });
    } catch (error) {
        console.error(`Abonelik planı güncelleme hatası (ID: ${planId}):`, error);
        return Response.internalServerError(res, 'Abonelik planı güncellenirken bir hata oluştu.');
    }
};

/**
 * Abonelik planını siler (Admin için)
 */
exports.deleteSubscriptionPlan = async (req, res) => {
    const { planId } = req.params;

    // Yetki kontrolü middleware ile yapılacak (checkRole(['ADMIN']))

    try {
        // Planın var olup olmadığını kontrol et
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return Response.notFound(res, 'Abonelik planı bulunamadı.');
        }

        // Aktif abonelikleri kontrol et
        const activeSubscriptions = await prisma.subscription.count({
            where: {
                planId,
                status: 'ACTIVE'
            }
        });

        if (activeSubscriptions > 0) {
            // Planı silmek yerine devre dışı bırak
            await prisma.subscriptionPlan.update({
                where: { id: planId },
                data: { isActive: false }
            });

            return Response.ok(res, 'Abonelik planı devre dışı bırakıldı. Aktif abonelikler olduğu için tamamen silinemedi.');
        }

        // Planı sil
        await prisma.subscriptionPlan.delete({
            where: { id: planId }
        });

        return Response.ok(res, 'Abonelik planı başarıyla silindi.');
    } catch (error) {
        console.error(`Abonelik planı silme hatası (ID: ${planId}):`, error);
        return Response.internalServerError(res, 'Abonelik planı silinirken bir hata oluştu.');
    }
};

/**
 * Abonelik satın alma işlemini başlatır
 */
exports.initiateSubscription = async (req, res) => {
    const { planId } = req.body;
    const userId = req.user.userId;

    try {
        // Planın var olup olmadığını kontrol et
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId, isActive: true }
        });

        if (!plan) {
            return Response.notFound(res, 'Geçerli bir abonelik planı bulunamadı.');
        }

        // Kullanıcının aktif aboneliğini kontrol et
        const activeSubscription = await prisma.subscription.findFirst({
            where: {
                userId,
                status: 'ACTIVE',
                endDate: { gt: new Date() }
            }
        });

        if (activeSubscription) {
            return Response.badRequest(res, 'Zaten aktif bir aboneliğiniz bulunmaktadır.');
        }

        // Kullanıcı bilgilerini getir
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                nickname: true,
                country: true,
                region: true
            }
        });

        // Ödeme işlemini başlat (Iyzico örneği)
        const price = plan.price.toString();
        const paidPrice = plan.discountPercentage > 0 
            ? (Number(price) * (100 - plan.discountPercentage) / 100).toFixed(2)
            : price;

        // Bekleyen abonelik kaydı oluştur
        const pendingSubscription = await prisma.subscription.create({
            data: {
                userId,
                planId,
                startDate: new Date(),
                endDate: new Date(Date.now() + plan.durationMonths * 30 * 24 * 60 * 60 * 1000), // Yaklaşık ay hesabı
                price: BigInt(price),
                paidPrice: BigInt(paidPrice),
                status: 'PENDING',
                paymentMethod: 'CREDIT_CARD'
            }
        });

        // Ödeme işlemi için Iyzico'ya istek gönder
        const request = {
            locale: 'tr',
            conversationId: pendingSubscription.id,
            price: price,
            paidPrice: paidPrice,
            currency: 'TRY',
            basketId: `subscription_${pendingSubscription.id}`,
            paymentGroup: 'SUBSCRIPTION',
            callbackUrl: `${process.env.API_URL}/api/subscriptions/callback`,
            buyer: {
                id: user.id,
                name: user.nickname || user.username,
                surname: 'User', // Kullanıcı soyadı yoksa varsayılan değer
                email: user.email,
                identityNumber: '11111111111', // Varsayılan değer
                registrationAddress: `${user.region || ''}, ${user.country || 'Unknown'}`,
                ip: req.ip,
                city: user.region || 'Unknown',
                country: user.country || 'Unknown'
            },
            shippingAddress: {
                contactName: user.nickname || user.username,
                city: user.region || 'Unknown',
                country: user.country || 'Unknown',
                address: `${user.region || ''}, ${user.country || 'Unknown'}`
            },
            billingAddress: {
                contactName: user.nickname || user.username,
                city: user.region || 'Unknown',
                country: user.country || 'Unknown',
                address: `${user.region || ''}, ${user.country || 'Unknown'}`
            },
            basketItems: [
                {
                    id: plan.id,
                    name: plan.name,
                    category1: 'Abonelik',
                    itemType: 'VIRTUAL',
                    price: price
                }
            ]
        };

        iyzipay.checkoutFormInitialize.create(request, async function (err, result) {
            if (err) {
                console.error('Iyzico ödeme başlatma hatası:', err);
                return Response.internalServerError(res, 'Ödeme işlemi başlatılırken bir hata oluştu.');
            }

            // Ödeme token'ını kaydet
            await prisma.subscription.update({
                where: { id: pendingSubscription.id },
                data: { paymentToken: result.token }
            });

            return Response.ok(res, 'Abonelik ödeme işlemi başlatıldı.', {
                odemeFormu: result.checkoutFormContent,
                token: result.token
            });
        });
    } catch (error) {
        console.error(`Abonelik başlatma hatası (UserID: ${userId}, PlanID: ${planId}):`, error);
        return Response.internalServerError(res, 'Abonelik işlemi başlatılırken bir hata oluştu.');
    }
};

/**
 * Ödeme sonucu callback işlemi
 */
exports.subscriptionCallback = async (req, res) => {
    const { token } = req.body;

    try {
        // Token ile aboneliği bul
        const subscription = await prisma.subscription.findFirst({
            where: { paymentToken: token },
            include: { plan: true }
        });

        if (!subscription) {
            return Response.notFound(res, 'Abonelik kaydı bulunamadı.');
        }

        // Ödeme sonucunu kontrol et
        iyzipay.checkoutForm.retrieve({
            locale: 'tr',
            token: token
        }, async function (err, result) {
            if (err) {
                console.error('Iyzico ödeme sonucu hatası:', err);
                return Response.internalServerError(res, 'Ödeme sonucu kontrol edilirken bir hata oluştu.');
            }

            // Ödeme başarılı mı kontrol et
            if (result.paymentStatus === 'SUCCESS') {
                // Aboneliği aktifleştir
                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        status: 'ACTIVE',
                        paymentId: result.paymentId,
                        lastPaymentDate: new Date()
                    }
                });

                // Kullanıcıya premium rozeti ver
                await prisma.user.update({
                    where: { id: subscription.userId },
                    data: { isPremium: true }
                });

                // İşlem kaydı oluştur
                await prisma.transaction.create({
                    data: {
                        userId: subscription.userId,
                        transactionType: 'SUBSCRIPTION_PAYMENT',
                        amount: subscription.paidPrice,
                        currency: 'TRY',
                        relatedEntityId: subscription.id,
                        relatedEntityType: 'SUBSCRIPTION',
                        status: 'COMPLETED',
                        paymentMethod: 'CREDIT_CARD',
                        paymentId: result.paymentId
                    }
                });

                // Bildirim gönder
                // TODO: Bildirim gönderme işlemi

                return res.redirect(`${process.env.FRONTEND_URL}/subscription/success`);
            } else {
                // Ödeme başarısız
                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        status: 'FAILED',
                        paymentId: result.paymentId
                    }
                });

                return res.redirect(`${process.env.FRONTEND_URL}/subscription/failed`);
            }
        });
    } catch (error) {
        console.error(`Abonelik callback hatası (Token: ${token}):`, error);
        return res.redirect(`${process.env.FRONTEND_URL}/subscription/error`);
    }
};

/**
 * Kullanıcının aktif aboneliğini getirir
 */
exports.getActiveSubscription = async (req, res) => {
    const userId = req.user.userId;

    try {
        const activeSubscription = await prisma.subscription.findFirst({
            where: {
                userId,
                status: 'ACTIVE',
                endDate: { gt: new Date() }
            },
            include: { plan: true }
        });

        if (!activeSubscription) {
            return Response.notFound(res, 'Aktif abonelik bulunamadı.');
        }

        return Response.ok(res, 'Aktif abonelik bilgileri getirildi.', { abonelik: activeSubscription });
    } catch (error) {
        console.error(`Aktif abonelik getirme hatası (UserID: ${userId}):`, error);
        return Response.internalServerError(res, 'Aktif abonelik bilgileri getirilirken bir hata oluştu.');
    }
};

/**
 * Kullanıcının abonelik geçmişini getirir
 */
exports.getSubscriptionHistory = async (req, res) => {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
        const subscriptions = await prisma.subscription.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit),
            include: { plan: true }
        });

        const totalSubscriptions = await prisma.subscription.count({
            where: { userId }
        });

        return Response.ok(res, 'Abonelik geçmişi getirildi.', {
            abonelikler: subscriptions,
            meta: {
                toplamAbonelik: totalSubscriptions,
                suankiSayfa: parseInt(page),
                toplamSayfa: Math.ceil(totalSubscriptions / parseInt(limit))
            }
        });
    } catch (error) {
        console.error(`Abonelik geçmişi getirme hatası (UserID: ${userId}):`, error);
        return Response.internalServerError(res, 'Abonelik geçmişi getirilirken bir hata oluştu.');
    }
};

/**
 * Aboneliği iptal eder
 */
exports.cancelSubscription = async (req, res) => {
    const { subscriptionId } = req.params;
    const userId = req.user.userId;

    try {
        // Aboneliğin var olup olmadığını kontrol et
        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: { plan: true }
        });

        if (!subscription) {
            return Response.notFound(res, 'Abonelik bulunamadı.');
        }

        // Yetki kontrolü
        if (subscription.userId !== userId && req.user.role !== 'ADMIN') {
            return Response.forbidden(res, 'Bu aboneliği iptal etme yetkiniz yok.');
        }

        // Abonelik durumunu kontrol et
        if (subscription.status !== 'ACTIVE') {
            return Response.badRequest(res, 'Yalnızca aktif abonelikler iptal edilebilir.');
        }

        // Aboneliği iptal et (dönem sonunda bitecek şekilde işaretle)
        await prisma.subscription.update({
            where: { id: subscriptionId },
            data: { cancelledAt: new Date(), autoRenew: false }
        });

        return Response.ok(res, 'Aboneliğiniz iptal edildi. Mevcut abonelik döneminizin sonuna kadar hizmetlerimizden yararlanmaya devam edebilirsiniz.');
    } catch (error) {
        console.error(`Abonelik iptal hatası (ID: ${subscriptionId}):`, error);
        return Response.internalServerError(res, 'Abonelik iptal edilirken bir hata oluştu.');
    }
};

/**
 * Aboneliği yeniler (manuel yenileme)
 */
exports.renewSubscription = async (req, res) => {
    const { subscriptionId } = req.params;
    const userId = req.user.userId;

    try {
        // Aboneliğin var olup olmadığını kontrol et
        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: { plan: true }
        });

        if (!subscription) {
            return Response.notFound(res, 'Abonelik bulunamadı.');
        }

        // Yetki kontrolü
        if (subscription.userId !== userId) {
            return Response.forbidden(res, 'Bu aboneliği yenileme yetkiniz yok.');
        }

        // Abonelik durumunu kontrol et
        if (subscription.status !== 'ACTIVE' && subscription.status !== 'EXPIRED') {
            return Response.badRequest(res, 'Bu abonelik yenilenemez.');
        }

        // Planın hala aktif olup olmadığını kontrol et
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: subscription.planId }
        });

        if (!plan || !plan.isActive) {
            return Response.badRequest(res, 'Bu abonelik planı artık mevcut değil.');
        }

        // Yeni abonelik başlatma işlemine yönlendir
        return Response.ok(res, 'Abonelik yenileme işlemi başlatılıyor.', {
            yonlendir: true,
            planId: subscription.planId
        });
    } catch (error) {
        console.error(`Abonelik yenileme hatası (ID: ${subscriptionId}):`, error);
        return Response.internalServerError(res, 'Abonelik yenilenirken bir hata oluştu.');
    }
};

/**
 * Abonelik durumunu kontrol eder ve gerekirse günceller
 * Bu fonksiyon zamanlanmış görevler tarafından çağrılabilir
 */
exports.checkSubscriptionStatus = async () => {
    try {
        // Süresi dolmuş aktif abonelikleri bul
        const expiredSubscriptions = await prisma.subscription.findMany({
            where: {
                status: 'ACTIVE',
                endDate: { lt: new Date() }
            }
        });

        // Abonelikleri güncelle
        for (const subscription of expiredSubscriptions) {
            // Otomatik yenileme aktif mi kontrol et
            if (subscription.autoRenew) {
                // TODO: Otomatik yenileme işlemi (ödeme entegrasyonu gerektirir)
                // Şimdilik manuel olarak yenilenmesi gerektiğini varsayalım
                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: { status: 'EXPIRED' }
                });

                // Kullanıcının başka aktif aboneliği var mı kontrol et
                const hasActiveSubscription = await prisma.subscription.findFirst({
                    where: {
                        userId: subscription.userId,
                        status: 'ACTIVE',
                        endDate: { gt: new Date() }
                    }
                });

                // Aktif abonelik yoksa premium durumunu kaldır
                if (!hasActiveSubscription) {
                    await prisma.user.update({
                        where: { id: subscription.userId },
                        data: { isPremium: false }
                    });
                }

                // Bildirim gönder
                // TODO: Bildirim gönderme işlemi
            } else {
                // Otomatik yenileme kapalıysa aboneliği sonlandır
                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: { status: 'EXPIRED' }
                });

                // Kullanıcının başka aktif aboneliği var mı kontrol et
                const hasActiveSubscription = await prisma.subscription.findFirst({
                    where: {
                        userId: subscription.userId,
                        status: 'ACTIVE',
                        endDate: { gt: new Date() }
                    }
                });

                // Aktif abonelik yoksa premium durumunu kaldır
                if (!hasActiveSubscription) {
                    await prisma.user.update({
                        where: { id: subscription.userId },
                        data: { isPremium: false }
                    });
                }

                // Bildirim gönder
                // TODO: Bildirim gönderme işlemi
            }
        }

        return { success: true, processedCount: expiredSubscriptions.length };
    } catch (error) {
        console.error('Abonelik durumu kontrol hatası:', error);
        return { success: false, error: error.message };
    }
};