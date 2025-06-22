// src/routes/stream/listing_routes.js
const express = require('express');
const router = express.Router();
const streamController = require('../../controllers/stream');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /streams/live:
 *   get:
 *     summary: Aktif (canlı) yayınları listeler
 *     tags: [Streams]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Aktif yayınlar listelendi."
 */
router.get('/live', streamController.listActiveStreams);

/**
 * @swagger
 * /streams/my-streams:
 *   get:
 *     summary: Giriş yapmış kullanıcının kendi yayınlarını listeler
 *     tags: [Streams, UserActions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, LIVE, ENDED, CANCELLED]
 *     responses:
 *       200:
 *         description: "Kullanıcının yayınları listelendi."
 */
router.get('/my-streams', authenticateToken, streamController.getMyStreams);

/**
 * @swagger
 * /streams/{streamId}:
 *   get:
 *     summary: Belirli bir yayının detaylarını getirir
 *     tags: [Streams]
 *     parameters:
 *       - $ref: '#/components/parameters/StreamIdPathParam'
 *     responses:
 *       200:
 *         description: "Yayın detayları getirildi."
 */
router.get('/:streamId', streamController.getStreamDetails);

module.exports = router;