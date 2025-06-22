// src/routes/stream/management_routes.js
const express = require('express');
const router = express.Router();
const streamController = require('../../controllers/stream');
const { authenticateToken } = require('../../middleware/authMiddleware');
// Yeni oluşturduğumuz stream upload middleware'ini import edelim
const uploadStreamCover = require('../../middleware/streamUploadMiddleware');

/**
 * @swagger
 * /streams:
 *   post:
 *     summary: Yeni bir canlı yayın başlatır veya planlar
 *     tags: [Streams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Yayın başlığı
 *               status:
 *                 type: string
 *                 enum: [LIVE, SCHEDULED]
 *                 description: Yayın durumu
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Yayın başlangıç zamanı (SCHEDULED durumu için)
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Yayının kapak fotoğrafı (isteğe bağlı)
 *     responses:
 *       201:
 *         description: Yayın başarıyla oluşturuldu/başlatıldı
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
 *                     streamId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     status:
 *                       type: string
 *                     coverImageUrl:
 *                       type: string
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkisiz erişim
 */
router.post(
    '/',
    authenticateToken,
    uploadStreamCover.single('coverImage'), // 'coverImage' alanından gelen tek dosyayı işle
    streamController.createOrUpdateStream
);

/**
 * @swagger
 * /streams/{streamId}:
 *   put:
 *     summary: Devam eden veya planlanmış bir yayının detaylarını günceller
 *     tags: [Streams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: streamId
 *         required: true
 *         schema:
 *           type: string
 *         description: Güncellenecek yayının ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Yayın başlığı
 *               status:
 *                 type: string
 *                 enum: [LIVE, SCHEDULED, ENDED]
 *                 description: Yayın durumu
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Yayın başlangıç zamanı
 *     responses:
 *       200:
 *         description: Yayın detayları güncellendi
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
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Yayın bulunamadı
 */
router.put('/:streamId', authenticateToken, streamController.updateStreamDetails);

/**
 * @swagger
 * /streams/{streamId}/end:
 *   post:
 *     summary: Bir canlı yayını sonlandırır
 *     tags: [Streams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: streamId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sonlandırılacak yayının ID'si
 *     responses:
 *       200:
 *         description: Yayın başarıyla sonlandırıldı
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
 *                     streamId:
 *                       type: string
 *                     status:
 *                       type: string
 *                     endTime:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Yayın zaten sonlandırılmış
 *       401:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Yayın bulunamadı
 */
router.post('/:streamId/end', authenticateToken, streamController.endStream);

module.exports = router;