// src/routes/chatRoom/room.routes.js
const express = require('express');
const router = express.Router();
const chatRoomController = require('../../controllers/chatRoom');
const { authenticateToken } = require('../../middleware/authMiddleware');
const upload = require('../../middleware/uploadMiddleware');

/**
 * @swagger
 * /chatrooms:
 *   post:
 *     summary: Yeni bir sohbet odası oluşturur
 *     tags: [ChatRooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRoomCreateRequest'
 *     responses:
 *       201:
 *         description: Sohbet odası başarıyla oluşturuldu.
 */
router.post('/', authenticateToken, chatRoomController.createChatRoom);

/**
 * @swagger
 * /chatrooms/public:
 *   get:
 *     summary: Herkese açık ve aktif sohbet odalarını listeler
 *     tags: [ChatRooms]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Sohbet odaları başarıyla listelendi.
 */
router.get('/public', chatRoomController.listPublicChatRooms);

/**
 * @swagger
 * /chatrooms/search:
 *   get:
 *     summary: Başlık veya açıklamaya göre sohbet odalarını arar
 *     tags: [ChatRooms]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Arama sonuçları başarıyla listelendi.
 */
router.get('/search', chatRoomController.searchChatRooms);

/**
 * @swagger
 * /chatrooms/{roomId}:
 *   get:
 *     summary: Belirli bir sohbet odasının detaylarını getirir
 *     tags: [ChatRooms]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Oda detayları başarıyla getirildi.
 */
router.get('/:roomId', chatRoomController.getChatRoomById);

/**
 * @swagger
 * /chatrooms/{roomId}:
 *   put:
 *     summary: Belirli bir sohbet odasını günceller (Sadece sahip/Admin)
 *     tags: [ChatRooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRoomUpdateRequest'
 *     responses:
 *       200:
 *         description: Oda başarıyla güncellendi.
 */
router.put('/:roomId', authenticateToken, chatRoomController.updateChatRoom);

/**
 * @swagger
 * /chatrooms/{roomId}:
 *   delete:
 *     summary: Belirli bir sohbet odasını siler (Sadece sahip/Admin)
 *     tags: [ChatRooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Oda başarıyla silindi.
 */
router.delete('/:roomId', authenticateToken, chatRoomController.deleteChatRoom);

/**
 * @swagger
 * /chatrooms/{roomId}/cover-image:
 *   put:
 *     summary: Bir sohbet odasının kapak fotoğrafını günceller (Sadece sahip/Admin)
 *     tags: [ChatRooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Yüklenecek kapak fotoğrafı dosyası.
 *     responses:
 *       200:
 *         description: Oda kapak fotoğrafı başarıyla güncellendi.
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
 *                     coverImageUrl:
 *                       type: string
 *       400:
 *         description: Geçersiz dosya formatı veya boyutu
 *       401:
 *         description: Yetkisiz erişim
 *       403:
 *         description: Bu işlem için yetkiniz yok (sadece sahip/admin)
 *       404:
 *         description: Sohbet odası bulunamadı
 */
router.put(
    '/:roomId/cover-image',
    authenticateToken,
    upload.single('coverImage'), // 'coverImage' form alanından tek dosya yükle
    chatRoomController.uploadCoverImage // Controller fonksiyonu
  );
module.exports = router;