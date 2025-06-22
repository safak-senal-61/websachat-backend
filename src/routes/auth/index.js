// src/routes/auth/index.js
// Bu dosya, sadece auth ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

// Hatalı olan yollar, dosya adlarıyla eşleşmesi için alt çizgi (_) kullanılarak düzeltildi.
const standardAuthRoutes = require('./standard_routes.js');
const registerRoutes = require('./register_routes.js');
const emailRoutes = require('./email_routes.js');
const passwordRoutes = require('./password_routes.js');
const oauthRoutes = require('./oauth_routes.js');
const userRoutes = require('./user_routes.js');
const authjsRoutes = require('./authjs_routes.js'); // Auth.js rotaları eklendi
const sessionRoutes = require('./session_routes.js'); // Oturum yönetimi rotaları eklendi
const apikeyRoutes = require('./apikey_routes.js'); // API anahtarı yönetimi rotaları eklendi
const deviceRoutes = require('./device_routes.js'); // Cihaz yönetimi rotaları eklendi
const roleRoutes = require('./role_routes.js'); // Rol ve izin yönetimi rotaları eklendi
// const groupRoutes = require('./group_routes.js'); // Kullanıcı grupları yönetimi rotaları eklendi - Dosya mevcut değil

// Rotaları birleştir
router.use(standardAuthRoutes);
router.use(registerRoutes);
router.use(emailRoutes);
router.use(passwordRoutes);
router.use(oauthRoutes);
router.use(userRoutes);
router.use(authjsRoutes); // Auth.js rotaları eklendi
router.use(sessionRoutes); // Oturum yönetimi rotaları eklendi
router.use(apikeyRoutes); // API anahtarı yönetimi rotaları eklendi
router.use(deviceRoutes); // Cihaz yönetimi rotaları eklendi
router.use(roleRoutes); // Rol ve izin yönetimi rotaları eklendi
// router.use(groupRoutes); // Kullanıcı grupları yönetimi rotaları eklendi - Dosya mevcut değil

module.exports = router;
