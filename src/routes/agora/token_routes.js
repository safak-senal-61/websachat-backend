// src/routes/agora/token_routes.js
const express = require('express');
const router = express.Router();
const agoraController = require('../../controllers/agora'); // Modüler controller'ı çağırıyoruz
const { authenticateToken } = require('../../middleware/authMiddleware'); // Token gerekiyorsa eklenir

/**
 * @swagger
 * /agora/get-token:
 *   get:
 *     summary: "Agora için bir RTC token'ı üretir."
 *     description: "Belirtilen kanal adı ve kullanıcı ID'si için bir RTC token oluşturur."
 *     tags: [Agora]
 *     parameters:
 *       - in: query
 *         name: channelName
 *         required: true
 *         description: "Katılınacak kanalın adı."
 *         schema:
 *           type: string
 *           example: "my-channel-123"
 *       - in: query
 *         name: uid
 *         required: true
 *         description: "Kanala katılan kullanıcının benzersiz ID'si."
 *         schema:
 *           type: string
 *           example: "user-456"
 *     responses:
 *       '200':
 *         description: "Başarıyla üretilen token ve App ID."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: "Agora RTC bağlantısı için kullanılacak token."
 *                 appId:
 *                   type: string
 *                   description: "Agora projesinin App ID'si."
 *       '400':
 *         description: "Gerekli parametreler eksik."
 *       '500':
 *         description: "Sunucu yapılandırması eksik veya token üretme hatası."
 */
// Bu endpoint genellikle kimlik doğrulaması gerektirir.
// Eğer herkesin token alabilmesi istenmiyorsa authenticateToken middleware'ini ekleyin.
router.get('/get-token', authenticateToken, agoraController.getToken);

module.exports = router;