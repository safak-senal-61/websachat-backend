// src/routes/follow/blocking_routes.js
const express = require('express');
const router = express.Router();
const followController = require('../../controllers/follow');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /follows/block/{targetUserId}:
 *   post:
 *     summary: Kullanıcıyı engelle
 *     tags: [UserBlockManagement (Follow Context)]
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
 *         description: Kullanıcı engellendi.
 */
router.post('/block/:targetUserId', authenticateToken, followController.blockUser);

/**
 * @swagger
 * /follows/unblock/{targetUserId}:
 *   post:
 *     summary: Kullanıcının engelini kaldır
 *     tags: [UserBlockManagement (Follow Context)]
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
 *         description: Engel kaldırıldı.
 */
router.post('/unblock/:targetUserId', authenticateToken, followController.unblockUser);

/**
 * @swagger
 * /follows/blocked:
 *   get:
 *     summary: Engellenen kullanıcıları listele
 *     tags: [UserBlockManagement (Follow Context)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Engellenenler listelendi.
 */
router.get('/blocked', authenticateToken, followController.getBlockedUsers);

module.exports = router;