// src/routes/auth/authjs_routes.js

const express = require('express');
const router = express.Router();
const authjsController = require('../../controllers/auth/authjs_controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * /auth/authjs/signin:
 *   post:
 *     summary: "Auth.js ile kullanıcı girişi yapar"
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               provider:
 *                 type: string
 *                 enum: [credentials, google, facebook, apple, twitter]
 *                 default: credentials
 *     responses:
 *       '200':
 *         description: "Giriş başarılı veya 2FA gerekli"
 *       '401':
 *         description: "Geçersiz kimlik bilgileri"
 */
router.post('/authjs/signin', authjsController.signIn);

/**
 * @swagger
 * /auth/authjs/signout:
 *   post:
 *     summary: "Auth.js ile kullanıcı çıkışı yapar"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Çıkış başarılı"
 */
router.post('/authjs/signout', authenticateToken, authjsController.signOut);

/**
 * @swagger
 * /auth/authjs/session:
 *   get:
 *     summary: "Auth.js oturum bilgilerini getirir"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: "Oturum bilgileri başarıyla getirildi"
 *       '401':
 *         description: "Oturum bulunamadı"
 */
router.get('/authjs/session', authenticateToken, authjsController.getSession);

/**
 * @swagger
 * /auth/authjs/verify-2fa:
 *   post:
 *     summary: "İki faktörlü doğrulama ile giriş yapar"
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - twoFactorToken
 *             properties:
 *               userId:
 *                 type: string
 *               twoFactorToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: "İki faktörlü doğrulama başarılı"
 *       '401':
 *         description: "Geçersiz 2FA kodu"
 */
router.post('/authjs/verify-2fa', authjsController.verifyTwoFactor);

// Sosyal medya giriş yönlendirmeleri
router.get('/authjs/google', (req, res) => {
  res.redirect('/api/auth/authjs/signin?provider=google');
});

router.get('/authjs/facebook', (req, res) => {
  res.redirect('/api/auth/authjs/signin?provider=facebook');
});

router.get('/authjs/apple', (req, res) => {
  res.redirect('/api/auth/authjs/signin?provider=apple');
});

router.get('/authjs/twitter', (req, res) => {
  res.redirect('/api/auth/authjs/signin?provider=twitter');
});

module.exports = router;