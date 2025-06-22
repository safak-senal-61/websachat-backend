// src/routes/notification/admin_routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notification');
const { authenticateToken, isAdmin } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /notifications/system-announcement:
 *   post:
 *     summary: Sistem genelinde duyuru gönderir (Admin)
 *     tags: [Notifications, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SystemAnnouncementRequest'
 *     responses:
 *       200:
 *         description: "Sistem duyurusu gönderildi."
 *       403:
 *         description: "Yetkiniz yok."
 */
router.post('/system-announcement', authenticateToken, isAdmin, notificationController.sendSystemAnnouncement);

module.exports = router;