// src/routes/auth/apikey_routes.js

const express = require('express');
const router = express.Router();
const apikeyController = require('../../controllers/auth/apikey_controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /auth/apikeys:
 *   post:
 *     summary: "Yeni bir API anahtarı oluşturur"
 *     tags: [Auth]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: "API anahtarı için tanımlayıcı isim"
 *               expiresIn:
 *                 type: integer
 *                 description: "Saniye cinsinden geçerlilik süresi (varsayılan: 1 yıl)"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [read, write, admin]
 *                 description: "API anahtarı izinleri"
 *     responses:
 *       '201':
 *         description: "API anahtarı başarıyla oluşturuldu"
 *       '401':
 *         description: "Yetkilendirme hatası"
 */
router.post('/apikeys', authenticateToken, apikeyController.createApiKey);

/**
 * @swagger
 * /auth/apikeys:
 *   get:
 *     summary: "Kullanıcının API anahtarlarını listeler"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "API anahtarları başarıyla getirildi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 */
router.get('/apikeys', authenticateToken, apikeyController.listApiKeys);

/**
 * @swagger
 * /auth/apikeys/{apiKeyId}:
 *   delete:
 *     summary: "Belirli bir API anahtarını siler"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apiKeyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "API anahtarı başarıyla silindi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '403':
 *         description: "Bu API anahtarını silme yetkiniz yok"
 */
router.delete('/apikeys/:apiKeyId', authenticateToken, apikeyController.deleteApiKey);

/**
 * @swagger
 * /auth/apikeys/{apiKeyId}/renew:
 *   post:
 *     summary: "Belirli bir API anahtarını yeniler"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apiKeyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "API anahtarı başarıyla yenilendi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '403':
 *         description: "Bu API anahtarını yenileme yetkiniz yok"
 */
router.post('/apikeys/:apiKeyId/renew', authenticateToken, apikeyController.renewApiKey);

module.exports = router;