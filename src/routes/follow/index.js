// src/routes/follow/index.js
// Bu dosya, sadece follow ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

const followActionsRoutes = require('./follow_actions_routes.js');
const requestsRoutes = require('./requests_routes.js');
const blockingRoutes = require('./blocking_routes.js');
const discoveryRoutes = require('./discovery_routes.js');
const profileRoutes = require('./profile_routes.js');
const invitationRoutes = require('./invitation_routes.js');
const verifyInvitationRoutes = require('./verify_invitation_routes.js');

// Rotaları birleştir. Express, path'leri doğru şekilde yönetecek.
router.use(followActionsRoutes);
router.use(requestsRoutes);
router.use(blockingRoutes);
router.use(discoveryRoutes);
router.use(profileRoutes);
router.use(invitationRoutes);
router.use(verifyInvitationRoutes);

module.exports = router;