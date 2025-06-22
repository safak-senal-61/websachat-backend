// src/routes/report/user_actions_routes.js
const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/report');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Yeni bir içerik/kullanıcı raporu oluşturur
 *     tags: [Reports, UserActions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportCreateRequest'
 *     responses:
 *       201:
 *         description: "Rapor başarıyla oluşturuldu."
 */
router.post('/', authenticateToken, reportController.createReport);

/**
 * @swagger
 * /reports/my-reports:
 *   get:
 *     summary: Giriş yapmış kullanıcının kendi oluşturduğu raporları listeler
 *     tags: [Reports, UserActions]
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
 *     responses:
 *       200:
 *         description: "Kullanıcının raporları listelendi."
 */
router.get('/my-reports', authenticateToken, reportController.getMyReports);

module.exports = router;