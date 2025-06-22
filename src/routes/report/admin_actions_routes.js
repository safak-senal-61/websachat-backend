// src/routes/report/admin_actions_routes.js
const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/report');
const { authenticateToken, isAdmin } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /reports/all:
 *   get:
 *     summary: Tüm raporları listeler (Sadece Admin/Moderatör)
 *     tags: [Reports, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [PENDING, REVIEWED_ACCEPTED, REVIEWED_REJECTED, RESOLVED]
 *       - name: reporterId
 *         in: query
 *         schema:
 *           type: string
 *       - name: reportedUserId
 *         in: query
 *         schema:
 *           type: string
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [USER, STREAM, ROOM, MESSAGE]
 *     responses:
 *       200:
 *         description: "Tüm raporlar listelendi."
 */
router.get('/all', authenticateToken, isAdmin, reportController.listAllReports);

/**
 * @swagger
 * /reports/{reportId}:
 *   get:
 *     summary: Belirli bir raporun detaylarını getirir (Sadece Admin/Moderatör)
 *     tags: [Reports, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ReportIdPathParam'
 *     responses:
 *       200:
 *         description: "Rapor detayı getirildi."
 */
router.get('/:reportId', authenticateToken, isAdmin, reportController.getReportById);

/**
 * @swagger
 * /reports/{reportId}/status:
 *   put:
 *     summary: Bir raporun durumunu günceller (Sadece Admin/Moderatör)
 *     tags: [Reports, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ReportIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportStatusUpdateRequest'
 *     responses:
 *       200:
 *         description: "Rapor durumu güncellendi."
 */
router.put('/:reportId/status', authenticateToken, isAdmin, reportController.updateReportStatus);

module.exports = router;