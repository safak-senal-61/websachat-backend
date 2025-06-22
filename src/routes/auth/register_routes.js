// src/routes/auth/register_routes.js
const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: "Yeni bir standart kullanıcı kaydı oluşturur."
 *     tags: [Auth, Register]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       '201':
 *         description: "Kullanıcı başarıyla kaydedildi."
 *       '409':
 *         description: "Kullanıcı adı veya e-posta zaten mevcut."
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/register-admin:
 *   post:
 *     summary: "Yeni bir admin kullanıcısı kaydı oluşturur (gizli anahtar gerektirir)."
 *     tags: [Auth, Register, Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - registrationSecret
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               registrationSecret:
 *                 type: string
 *     responses:
 *       '201':
 *         description: "Admin kullanıcısı başarıyla oluşturuldu."
 *       '403':
 *         description: "Geçersiz kayıt anahtarı."
 */
router.post('/register-admin', authController.registerAdmin);

/**
 * @swagger
 * /auth/register-wip:
 *   post:
 *     summary: "Yeni bir WIP kullanıcısı kaydı oluşturur (gizli anahtar gerektirir)."
 *     tags: [Auth, Register, WIP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - registrationSecret
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               registrationSecret:
 *                 type: string
 *     responses:
 *       '501':
 *         description: "Henüz implemente edilmedi."
 */
router.post('/register-wip', authController.registerWip);

module.exports = router;

// =====================================