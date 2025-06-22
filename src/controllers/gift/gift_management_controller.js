// src/controllers/gift/gift_management_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

// Helper: BigInt alanlarını yanıtta string'e çevir
const sanitizeGiftResponse = (gift) => {
    if (!gift) return null;
    return { ...gift, cost: gift.cost?.toString(), value: gift.value?.toString() };
};

exports.createGift = async (req, res) => {
    const { giftId, name, description, imageUrl, cost, value } = req.body;
    if (!giftId || !name || cost === undefined || value === undefined) {
        return Response.badRequest(res, 'Hediye ID, Ad, Maliyet ve Değer zorunludur.');
    }
    try {
        const newGift = await prisma.gift.create({
            data: {
                giftId,
                name,
                description,
                imageUrl,
                cost: BigInt(cost),
                value: BigInt(value),
            }
        });
        return Response.created(res, "Hediye başarıyla oluşturuldu.", { hediye: sanitizeGiftResponse(newGift) });
    } catch (error) {
        console.error("Hediye oluşturma hatası:", error);
        return Response.internalServerError(res, "Hediye oluşturulurken bir hata oluştu.");
    }
};

exports.listGifts = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    try {
        const gifts = await prisma.gift.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit),
        });
        const totalGifts = await prisma.gift.count({ where: { isActive: true } });
        const sanitizedGifts = gifts.map(sanitizeGiftResponse);
        return Response.ok(res, "Hediyeler listelendi.", {
            hediyeler: sanitizedGifts,
            meta: { toplamHediye: totalGifts, suankiSayfa: parseInt(page), toplamSayfa: Math.ceil(totalGifts / limit) }
        });
    } catch (error) {
        console.error("Hediyeleri listeleme hatası:", error);
        return Response.internalServerError(res, "Hediyeler listelenirken bir hata oluştu.");
    }
};

exports.getGiftById = async (req, res) => {
    const { giftModelId } = req.params;
    try {
        const gift = await prisma.gift.findUnique({ where: { id: giftModelId } });
        if (!gift) {
            return Response.notFound(res, "Hediye bulunamadı.");
        }
        return Response.ok(res, "Hediye detayları getirildi.", { hediye: sanitizeGiftResponse(gift) });
    } catch (error) {
        console.error(`Hediye getirme hatası:`, error);
        return Response.internalServerError(res, "Hediye detayları getirilirken bir hata oluştu.");
    }
};

exports.updateGift = async (req, res) => {
    const { giftModelId } = req.params;
    const dataToUpdate = req.body;
    if (dataToUpdate.cost) dataToUpdate.cost = BigInt(dataToUpdate.cost);
    if (dataToUpdate.value) dataToUpdate.value = BigInt(dataToUpdate.value);

    try {
        const updatedGift = await prisma.gift.update({
            where: { id: giftModelId },
            data: dataToUpdate
        });
        return Response.ok(res, "Hediye güncellendi.", { hediye: sanitizeGiftResponse(updatedGift) });
    } catch (error) {
        console.error(`Hediye güncelleme hatası:`, error);
        return Response.internalServerError(res, "Hediye güncellenirken bir hata oluştu.");
    }
};

exports.deleteGift = async (req, res) => {
    const { giftModelId } = req.params;
    try {
        // Genellikle hediyeleri silmek yerine pasif hale getirmek daha iyidir.
        await prisma.gift.update({ where: { id: giftModelId }, data: { isActive: false } });
        return Response.ok(res, "Hediye başarıyla pasif hale getirildi.");
    } catch (error) {
        console.error(`Hediye silme/pasifleştirme hatası:`, error);
        return Response.internalServerError(res, "Hediye silinirken/pasifleştirilirken bir hata oluştu.");
    }
};
