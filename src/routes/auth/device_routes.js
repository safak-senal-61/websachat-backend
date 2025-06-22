// src/routes/auth/device_routes.js

const express = require('express');
const router = express.Router();
const deviceController = require('../../controllers/auth/device_controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /auth/devices:
 *   get:
 *     summary: "Kullanıcının güvenilir cihazlarını listeler"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Güvenilir cihazlar başarıyla getirildi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 */
router.get('/devices', authenticateToken, deviceController.listDevices);

/**
 * @swagger
 * /auth/devices:
 *   post:
 *     summary: "Yeni bir güvenilir cihaz ekler"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceName
 *             properties:
 *               deviceName:
 *                 type: string
 *                 description: "Cihaz için tanımlayıcı isim"
 *               deviceType:
 *                 type: string
 *                 enum: [mobile, desktop, tablet, other]
 *                 description: "Cihaz tipi"
 *     responses:
 *       '201':
 *         description: "Güvenilir cihaz başarıyla eklendi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 */
router.post('/devices', authenticateToken, deviceController.addDevice);

/**
 * @swagger
 * /auth/devices/{deviceId}:
 *   delete:
 *     summary: "Belirli bir güvenilir cihazı siler"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Güvenilir cihaz başarıyla silindi"
 *       '400':
 *         description: "Şu anda kullandığınız cihazı silemezsiniz"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '403':
 *         description: "Bu cihazı silme yetkiniz yok"
 */
router.delete('/devices/:deviceId', authenticateToken, deviceController.removeDevice);

/**
 * @swagger
 * /auth/devices/{deviceId}:
 *   put:
 *     summary: "Belirli bir cihazın adını günceller"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceName
 *             properties:
 *               deviceName:
 *                 type: string
 *                 description: "Cihaz için yeni tanımlayıcı isim"
 *     responses:
 *       '200':
 *         description: "Cihaz adı başarıyla güncellendi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '403':
 *         description: "Bu cihazı güncelleme yetkiniz yok"
 */
router.put('/devices/:deviceId', authenticateToken, deviceController.updateDeviceName);

/**
 * @swagger
 * /auth/devices/all:
 *   delete:
 *     summary: "Mevcut cihaz hariç tüm cihazları siler"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Diğer tüm cihazlar başarıyla silindi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 */
router.delete('/devices/all', authenticateToken, deviceController.removeAllDevices);

module.exports = router;