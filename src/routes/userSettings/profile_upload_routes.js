// src/routes/userSettings/profile_upload_routes.js
const express = require('express');
const router = express.Router();
const userSettingsController = require('../../controllers/userSettings');
const uploadProfileImage = require('../../middleware/profileUploadMiddleware');

/**
 * @swagger
 * /settings/profile/upload-image:
 *   post:
 *     summary: "Kullanıcının profil fotoğrafını yükler."
 *     tags: [UserSettings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Yüklenecek profil fotoğrafı (max 2MB, jpeg, jpg, png, gif, webp)
 *     responses:
 *       200:
 *         description: "Profil fotoğrafı başarıyla yüklendi."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     kullanici:
 *                       type: object
 *                     profilePictureUrl:
 *                       type: string
 *       400:
 *         description: "Geçersiz dosya formatı veya boyutu."
 *       500:
 *         description: "Sunucu hatası."
 */
router.post('/profile/upload-image', uploadProfileImage.single('profileImage'), userSettingsController.uploadProfileImage);

module.exports = router;