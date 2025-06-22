// src/routes/follow/follow_actions_routes.js
const express = require('express');
const router = express.Router();
const followController = require('../../controllers/follow');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /follows/user/{targetUserId}:
 *   post:
 *     summary: Belirli bir kullanıcıyı takip eder veya gizli ise takip isteği gönderir
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: targetUserId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: İşlem başarılı.
 */
router.post('/user/:targetUserId', authenticateToken, followController.followUserOrSendRequest);

/**
 * @swagger
 * /follows/user/{targetUserId}/unfollow:
 *   post:
 *     summary: Belirli bir kullanıcıyı takipten çıkarır
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: targetUserId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kullanıcı takipten çıkarıldı.
 */
router.post('/user/:targetUserId/unfollow', authenticateToken, followController.unfollowUser);

/**
 * @swagger
 * /follows/user/{userId}/followers:
 *   get:
 *     summary: Kullanıcının takipçilerini listeler
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Takipçiler listelendi.
 */
router.get('/user/:userId/followers', authenticateToken, followController.listFollowers);

/**
 * @swagger
 * /follows/user/{userId}/following:
 *   get:
 *     summary: Kullanıcının takip ettiklerini listeler
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Takip edilenler listelendi.
 */
router.get('/user/:userId/following', authenticateToken, followController.listFollowing);

/**
 * @swagger
 * /follows/status/{targetUserId}:
 *   get:
 *     summary: Takip durumunu kontrol et
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: targetUserId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Takip durumu.
 */
router.get('/status/:targetUserId', authenticateToken, followController.checkFollowStatus);

module.exports = router;