// src/routes/userSettings/username_routes.js
const express = require('express');
const router = express.Router();
const userSettingsController = require('../../controllers/userSettings');

/**
 * @swagger
 * /settings/username:
 *   put:
 *     summary: "Kullanıcı adını değiştirir"
 *     tags: [User Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newUsername
 *               - password
 *             properties:
 *               newUsername:
 *                 type: string
 *                 description: "Yeni kullanıcı adı"
 *                 example: "yeni_kullanici_adi"
 *               password:
 *                 type: string
 *                 description: "Mevcut şifre (doğrulama için)"
 *                 format: password
 *     responses:
 *       200:
 *         description: "Kullanıcı adı başarıyla değiştirildi"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Kullanıcı adınız başarıyla güncellendi."
 *                 data:
 *                   type: object
 *                   properties:
 *                     kullanici:
 *                       type: object
 *       400:
 *         description: "Geçersiz istek"
 *       401:
 *         description: "Yetkilendirme hatası"
 *       409:
 *         description: "Kullanıcı adı zaten kullanılıyor"
 *       500:
 *         description: "Sunucu hatası"
 */
router.put('/username', userSettingsController.changeUsername);

module.exports = router;