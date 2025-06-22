// src/routes/twoFactor/index.js
// Bu dosya, sadece 2FA ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

const setupRoutes = require('./setup_routes.js');
const verificationRoutes = require('./verification_routes.js');
const backupCodesRoutes = require('./backup_codes_routes.js');

// Rotaları birleştir.
router.use('/', setupRoutes);
router.use('/', verificationRoutes);
router.use('/', backupCodesRoutes);

module.exports = router;
