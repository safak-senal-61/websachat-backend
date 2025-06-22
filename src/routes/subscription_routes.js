// src/routes/subscription_routes.js
const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Abonelik planları (herkese açık)
router.get('/plans', subscriptionController.listSubscriptionPlans);
router.get('/plans/:planId', subscriptionController.getSubscriptionPlanById);

// Abonelik planı yönetimi (sadece admin)
router.post('/plans', authenticateToken, authorizeRoles('ADMIN'), subscriptionController.createSubscriptionPlan);
router.put('/plans/:planId', authenticateToken, authorizeRoles('ADMIN'), subscriptionController.updateSubscriptionPlan);
router.delete('/plans/:planId', authenticateToken, authorizeRoles('ADMIN'), subscriptionController.deleteSubscriptionPlan);

// Kullanıcı abonelik işlemleri
router.post('/subscribe', authenticateToken, subscriptionController.initiateSubscription);
router.post('/callback', subscriptionController.subscriptionCallback); // Ödeme sistemi callback
router.get('/active', authenticateToken, subscriptionController.getActiveSubscription);
router.get('/history', authenticateToken, subscriptionController.getSubscriptionHistory);
router.post('/cancel/:subscriptionId', authenticateToken, subscriptionController.cancelSubscription);
router.post('/renew/:subscriptionId', authenticateToken, subscriptionController.renewSubscription);

module.exports = router;