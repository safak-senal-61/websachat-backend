// src/routes/notification/user_routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notification');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /notifications/me:
 *   get:
 *     summary: Giriş yapmış kullanıcının bildirimlerini listeler
 *     tags: [Notifications, UserActions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - name: isRead
 *         in: query
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: "Bildirimler listelendi."
 */
router.get('/me', authenticateToken, notificationController.getMyNotifications);

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   post:
 *     summary: Belirli bir bildirimi okundu olarak işaretler
 *     tags: [Notifications, UserActions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NotificationIdPathParam'
 *     responses:
 *       200:
 *         description: "Bildirim okundu olarak işaretlendi."
 */
router.post('/:notificationId/read', authenticateToken, notificationController.markNotificationAsRead);

/**
 * @swagger
 * /notifications/mark-all-read:
 *   post:
 *     summary: Tüm okunmamış bildirimleri okundu olarak işaretler
 *     tags: [Notifications, UserActions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Tüm bildirimler okundu olarak işaretlendi."
 */
router.post('/mark-all-read', authenticateToken, notificationController.markAllNotificationsAsRead);

module.exports = router;