// src/routes/gameserver/server_routes.js
const express = require('express');
const router = express.Router();
const gameServerController = require('../../controllers/gameserver');
const { authenticateToken, authorizeRoles } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /:
 *   get:
 *     summary: "Tüm oyun sunucularını listeler"
 *     tags: [Game Servers]
 *     responses:
 *       '200':
 *         description: "Oyun sunucuları başarıyla listelendi"
 */
router.get('/', gameServerController.listGameServers);

/**
 * @swagger
 * /{serverId}:
 *   get:
 *     summary: "Belirli bir oyun sunucusunun detaylarını getirir"
 *     tags: [Game Servers]
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Oyun sunucusu detayları başarıyla getirildi"
 *       '404':
 *         description: "Oyun sunucusu bulunamadı"
 */
router.get('/:serverId', gameServerController.getGameServerById);

/**
 * @swagger
 * /:
 *   post:
 *     summary: "Yeni bir oyun sunucusu oluşturur (Admin)"
 *     tags: [Game Servers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - gameId
 *               - region
 *               - capacity
 *             properties:
 *               name:
 *                 type: string
 *               gameId:
 *                 type: string
 *               region:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               ipAddress:
 *                 type: string
 *               port:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [ONLINE, OFFLINE, MAINTENANCE]
 *               settings:
 *                 type: object
 *     responses:
 *       '201':
 *         description: "Oyun sunucusu başarıyla oluşturuldu"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 */
router.post('/', authenticateToken, authorizeRoles('ADMIN'), gameServerController.createGameServer);

/**
 * @swagger
 * /{serverId}:
 *   put:
 *     summary: "Bir oyun sunucusunu günceller (Admin)"
 *     tags: [Game Servers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               region:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               ipAddress:
 *                 type: string
 *               port:
 *                 type: integer
 *               settings:
 *                 type: object
 *     responses:
 *       '200':
 *         description: "Oyun sunucusu başarıyla güncellendi"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Oyun sunucusu bulunamadı"
 */
router.put('/:serverId', authenticateToken, authorizeRoles('ADMIN'), gameServerController.updateGameServer);

/**
 * @swagger
 * /{serverId}:
 *   delete:
 *     summary: "Bir oyun sunucusunu siler (Admin)"
 *     tags: [Game Servers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Oyun sunucusu başarıyla silindi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Oyun sunucusu bulunamadı"
 */
router.delete('/:serverId', authenticateToken, authorizeRoles('ADMIN'), gameServerController.deleteGameServer);

/**
 * @swagger
 * /{serverId}/status:
 *   put:
 *     summary: "Bir oyun sunucusunun durumunu günceller (Admin/System)"
 *     tags: [Game Servers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ONLINE, OFFLINE, MAINTENANCE]
 *               message:
 *                 type: string
 *     responses:
 *       '200':
 *         description: "Oyun sunucusu durumu başarıyla güncellendi"
 *       '400':
 *         description: "Geçersiz istek"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '404':
 *         description: "Oyun sunucusu bulunamadı"
 */
router.put('/:serverId/status', authenticateToken, authorizeRoles('ADMIN', 'SYSTEM'), gameServerController.updateServerStatus);

module.exports = router;