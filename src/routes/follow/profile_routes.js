// src/routes/follow/profile_routes.js
const express = require('express');
const router = express.Router();
const followController = require('../../controllers/follow');
const { authenticateToken } = require('../../middleware/authMiddleware');

// ÖNEMLİ NOT:
// Bu route'un ideal yeri ayrı bir 'users_routes' modülüdür.
// Ancak mevcut 'follow_routes.js' dosyasını bozmamak adına buraya eklenmiştir.
// Eğer bu router '/follows' altında mount ediliyorsa, erişim yolu '/follows/profile/:username' olacaktır.

/**
 * @swagger
 * /follows/profile/{username}:
 *   get:
 *     summary: Kullanıcı profilini getirir (mevcut yapıya göre)
 *     description: |
 *       Belirtilen kullanıcının profil bilgilerini döndürür.
 *       **Not:** İdeal RESTful yapı `/users/{username}` şeklindedir. Bu yol, mevcut router yapısına uyum sağlamak için `/follows/profile/{username}` olarak ayarlanmıştır.
 *     tags: [UserProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         description: Profil bilgileri getirilecek kullanıcının kullanıcı adı.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kullanıcı profil bilgileri.
 *       404:
 *         description: Kullanıcı bulunamadı.
 */
router.get('/profile/:username', authenticateToken, followController.getUserProfileByUsername);

module.exports = router;