// src/routes/subscription/index.js
// Bu dosya, subscription ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

// Subscription alt rotalarını import et
const planRoutes = require('./plan_routes.js');
const userSubscriptionRoutes = require('./user_subscription_routes.js');

// Rotaları birleştir
router.use(planRoutes);
router.use(userSubscriptionRoutes);

module.exports = router;