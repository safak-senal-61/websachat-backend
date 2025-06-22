// src/routes/game/category_routes.js
const express = require('express');
const router = express.Router();
const gameController = require('../../controllers/game');
const { authenticateToken, isAdmin } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /games/categories:
 *   post:
 *     summary: Yeni bir oyun kategorisi oluşturur (Sadece Admin)
 *     tags: [GameCategories, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GameCategoryCreateRequest'
 *     responses:
 *       201:
 *         description: Kategori başarıyla oluşturuldu.
 */
router.post('/categories', authenticateToken, isAdmin, gameController.createGameCategory);

/**
 * @swagger
 * /games/categories:
 *   get:
 *     summary: Tüm oyun kategorilerini listeler
 *     tags: [GameCategories]
 *     responses:
 *       200:
 *         description: Kategoriler başarıyla listelendi.
 */
router.get('/categories', gameController.listGameCategories);

/**
 * @swagger
 * /games/category/{categoryIdOrSlug}:
 *   get:
 *     summary: Belirli bir kategoriye ait oyunları listeler
 *     tags: [GameCategories]
 *     parameters:
 *       - $ref: '#/components/parameters/CategoryIdOrSlugPathParam'
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *     responses:
 *       200:
 *         description: Kategoriye ait oyunlar başarıyla listelendi.
 */
router.get('/category/:categoryIdOrSlug', gameController.getGamesByCategory);

module.exports = router;