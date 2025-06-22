// src/controllers/game/category_controller.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const Response = require('../../utils/responseHandler');

exports.createGameCategory = async (req, res) => {
    const { name, slug, iconUrl } = req.body;
    if (!name) return Response.badRequest(res, "Kategori adı zorunludur.");
    const finalSlug = slug || name.trim().toLowerCase().replace(/\s+/g, '-');
    try {
        const newCategory = await prisma.gameCategory.create({
            data: { name: name.trim(), slug: finalSlug, iconUrl }
        });
        return Response.created(res, "Oyun kategorisi oluşturuldu.", { kategori: newCategory });
    } catch (error) {
        console.error("Oyun kategorisi oluşturma hatası:", error);
        return Response.internalServerError(res, "Kategori oluşturulurken bir hata oluştu.");
    }
};

exports.listGameCategories = async (req, res) => {
    try {
        const categories = await prisma.gameCategory.findMany({ orderBy: { name: 'asc' } });
        return Response.ok(res, "Oyun kategorileri listelendi.", { kategoriler: categories });
    } catch (error) {
        console.error("Kategorileri listeleme hatası:", error);
        return Response.internalServerError(res, "Kategoriler listelenirken bir hata oluştu.");
    }
};

exports.getGamesByCategory = async (req, res) => {
    const { categoryIdOrSlug } = req.params;
    try {
        const games = await prisma.game.findMany({
            where: {
                category: {
                    OR: [{ id: categoryIdOrSlug }, { slug: categoryIdOrSlug }]
                }
            },
            include: { category: true }
        });
        return Response.ok(res, "Kategoriye göre oyunlar listelendi.", { oyunlar: games });
    } catch (error) {
        console.error("Kategoriye göre oyunları listeleme hatası:", error);
        return Response.internalServerError(res, "Oyunlar listelenirken bir hata oluştu.");
    }
};
