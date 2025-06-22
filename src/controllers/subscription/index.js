// src/controllers/subscription/index.js
const subscriptionController = require('./subscription_controller');

module.exports = {
    // Abonelik planı yönetimi
    listSubscriptionPlans: subscriptionController.listSubscriptionPlans,
    getSubscriptionPlanById: subscriptionController.getSubscriptionPlanById,
    createSubscriptionPlan: subscriptionController.createSubscriptionPlan,
    updateSubscriptionPlan: subscriptionController.updateSubscriptionPlan,
    deleteSubscriptionPlan: subscriptionController.deleteSubscriptionPlan,
    
    // Abonelik işlemleri
    initiateSubscription: subscriptionController.initiateSubscription,
    subscriptionCallback: subscriptionController.subscriptionCallback,
    getActiveSubscription: subscriptionController.getActiveSubscription,
    getSubscriptionHistory: subscriptionController.getSubscriptionHistory,
    cancelSubscription: subscriptionController.cancelSubscription,
    renewSubscription: subscriptionController.renewSubscription,
    
    // Sistem işlemleri
    checkSubscriptionStatus: subscriptionController.checkSubscriptionStatus
};