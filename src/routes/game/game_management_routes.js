// src/routes/game/game_management_routes.js
const express = require('express');
const router = express.Router();
// Modüler controller yapısını çağırıyoruz
const gameController = require('../../controllers/game');
const { authenticateToken, isAdmin } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /games:
 *   post:
 *     summary: Yeni bir oyun oluşturur (Sadece Admin)
 *     tags: [Games, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GameCreateRequest'
 *     responses:
 *       201:
 *         description: Oyun başarıyla oluşturuldu.
 */
router.post('/', authenticateToken, isAdmin, gameController.createGame);

/**
 * @swagger
 * /games:
 *   get:
 *     summary: Tüm oyunları listeler (filtreleme ve sayfalama ile)
 *     tags: [Games]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: "Oyun adı, açıklaması vb. arama."
 *       - name: popular
 *         in: query
 *         schema:
 *           type: boolean
 *         description: "Popülerliğe göre sırala."
 *     responses:
 *       200:
 *         description: Oyunlar başarıyla listelendi.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedGamesResponse'
 */
router.get('/', gameController.listGames);

/**
 * @swagger
 * /games/{gameModelId}:
 *   get:
 *     summary: Belirli bir oyunun detaylarını getirir
 *     tags: [Games]
 *     parameters:
 *       - $ref: '#/components/parameters/GameModelIdPathParam'
 *     responses:
 *       200:
 *         description: Oyun detayları başarıyla getirildi.
 */
router.get('/:gameModelId', gameController.getGameById);

/**
 * @swagger
 * /games/{gameModelId}:
 *   put:
 *     summary: Belirli bir oyunu günceller (Sadece Admin)
 *     tags: [Games, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GameModelIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GameUpdateRequest'
 *     responses:
 *       200:
 *         description: Oyun başarıyla güncellendi.
 */
router.put('/:gameModelId', authenticateToken, isAdmin, gameController.updateGame);

/**
 * @swagger
 * /games/{gameModelId}:
 *   delete:
 *     summary: Belirli bir oyunu siler (Sadece Admin)
 *     tags: [Games, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GameModelIdPathParam'
 *     responses:
 *       200:
 *         description: Oyun başarıyla silindi.
 */
router.delete('/:gameModelId', authenticateToken, isAdmin, gameController.deleteGame);

module.exports = router;