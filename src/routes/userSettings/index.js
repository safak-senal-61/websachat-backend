// src/routes/userSettings/index.js
// Bu dosya, sadece userSettings ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');

const profileRoutes = require('./profile_routes.js');
const securityRoutes = require('./security_routes.js');
const accountRoutes = require('./account_routes.js');

// Bu modüldeki tüm rotalar için kimlik doğrulaması uygula
// Not: security_routes içindeki verifyNewEmail bu kuralın dışında kalır çünkü kendi içinde middleware kullanmaz.
router.use(authenticateToken);

// Alt rotaları birleştir
router.use('/', profileRoutes);
router.use('/', securityRoutes); // Bu, içindeki authenticateToken'ları tekrar uygular, zararı olmaz.
router.use('/', accountRoutes);

module.exports = router;
