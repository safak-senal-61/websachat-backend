// src/routes/user_routes.js
const express = require('express');
const userRouter = express.Router();
// Kullanıcı profilini getiren fonksiyon follow.js dosyasında olduğu için onu kullanacağız.
// Eğer bu fonksiyonu başka bir user_controller.js dosyasına taşıdıysan, onu require etmelisin.
const followController = require('../controllers/follow');
const { authenticateToken } = require('../middleware/authMiddleware');

// Bu rota, /users/:username/profile şeklinde bir adrese gelen istekleri karşılayacak.
userRouter.get('/:username/profile', authenticateToken, followController.getUserProfileByUsername);

module.exports = userRouter;