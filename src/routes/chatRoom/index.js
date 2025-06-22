// src/routes/chatRoom/index.js
// Bu dosya, sadece chatRoom ile ilgili tüm alt rota dosyalarını birleştirir.

const express = require('express');
const router = express.Router();

// Dosya adlarıyla eşleşmesi için require yollarındaki '.' (nokta) '_' (alt çizgi) ile değiştirildi.
const roomRoutes = require('./room_routes.js');
const participantRoutes = require('./participant_routes.js');
const moderationRoutes = require('./moderation_routes.js');
const messageRoutes = require('./message_routes.js');

// Tek bir router'a farklı işlevleri olan router'ları bağlıyoruz.
// Express, /:roomId gibi parametreleri doğru şekilde yönetecektir.
router.use('/', roomRoutes);
router.use('/', participantRoutes);
router.use('/', moderationRoutes);
router.use('/', messageRoutes);

module.exports = router;
