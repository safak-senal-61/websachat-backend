// src/routes/auth/session_routes.js

const express = require('express');
const router = express.Router();
const sessionController = require('../../controllers/auth/session_controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /auth/sessions:
 *   get:
 *     summary: "Kullanıcının aktif oturumlarını listeler"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Aktif oturumlar başarıyla getirildi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 */
router.get('/sessions', authenticateToken, sessionController.listSessions);

/**
 * @swagger
 * /auth/sessions/{sessionId}:
 *   get:
 *     summary: "Belirli bir oturumun detaylarını getirir"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Oturum detayları başarıyla getirildi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '403':
 *         description: "Bu oturum bilgilerine erişim yetkiniz yok"
 */
router.get('/sessions/:sessionId', authenticateToken, sessionController.getSessionDetails);

/**
 * @swagger
 * /auth/sessions/{sessionId}:
 *   delete:
 *     summary: "Belirli bir oturumu sonlandırır"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Oturum başarıyla sonlandırıldı"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '403':
 *         description: "Bu oturumu sonlandırma yetkiniz yok"
 */
router.delete('/sessions/:sessionId', authenticateToken, sessionController.terminateSession);

/**
 * @swagger
 * /auth/sessions:
 *   delete:
 *     summary: "Mevcut oturum hariç tüm oturumları sonlandırır"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Diğer tüm cihazlardaki oturumlar başarıyla sonlandırıldı"
 *       '401':
 *         description: "Yetkilendirme hatası"
 */
router.delete('/sessions', authenticateToken, sessionController.terminateAllSessions);

module.exports = router;