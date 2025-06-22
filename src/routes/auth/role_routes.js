// src/routes/auth/role_routes.js

const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/auth/role_controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /auth/roles:
 *   get:
 *     summary: "Kullanıcı rollerini listeler"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Roller başarıyla getirildi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '403':
 *         description: "Bu işlemi yapmak için yetkiniz yok"
 */
router.get('/roles', authenticateToken, roleController.listRoles);

/**
 * @swagger
 * /auth/roles/user:
 *   put:
 *     summary: "Kullanıcının rolünü günceller"
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
 *               - userId
 *               - role
 *             properties:
 *               userId:
 *                 type: string
 *                 description: "Rolü güncellenecek kullanıcının ID'si"
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MODERATOR, USER, GUEST]
 *                 description: "Yeni rol"
 *     responses:
 *       '200':
 *         description: "Kullanıcı rolü başarıyla güncellendi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '403':
 *         description: "Bu işlemi yapmak için yetkiniz yok"
 *       '404':
 *         description: "Kullanıcı bulunamadı"
 */
router.put('/roles/user', authenticateToken, roleController.updateUserRole);

/**
 * @swagger
 * /auth/permissions/{userId}:
 *   get:
 *     summary: "Kullanıcının izinlerini listeler"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Kullanıcı izinleri başarıyla getirildi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '403':
 *         description: "Bu işlemi yapmak için yetkiniz yok"
 *       '404':
 *         description: "Kullanıcı bulunamadı"
 */
router.get('/permissions/:userId', authenticateToken, roleController.listUserPermissions);

/**
 * @swagger
 * /auth/permissions/{userId}:
 *   put:
 *     summary: "Kullanıcının özel izinlerini günceller"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "İzinler dizisi"
 *     responses:
 *       '200':
 *         description: "Kullanıcı izinleri başarıyla güncellendi"
 *       '401':
 *         description: "Yetkilendirme hatası"
 *       '403':
 *         description: "Bu işlemi yapmak için yetkiniz yok"
 *       '404':
 *         description: "Kullanıcı bulunamadı"
 */
router.put('/permissions/:userId', authenticateToken, roleController.updateUserPermissions);

module.exports = router;