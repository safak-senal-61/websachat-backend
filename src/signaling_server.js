// src/signaling_server.js

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./controllers/auth/constants'); // JWT secret'ı alıyoruz

function initializeSignalingServer(io) {
    
    // --- YENİ: Socket.IO Middleware ---
    // Bu middleware, her yeni bağlantı kurulduğunda çalışır.
    // Token'ı doğrular ve kullanıcı bilgilerini alır.
    io.use((socket, next) => {
        const token = socket.handshake.auth.token; // Frontend'den gönderilen token

        if (!token) {
            console.error("❌ WebSocket Bağlantı Hatası: Token bulunamadı.");
            return next(new Error('Authentication error: Token not provided.'));
        }

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error("❌ WebSocket Bağlantı Hatası: Geçersiz token.", err.message);
                return next(new Error('Authentication error: Invalid token.'));
            }
            // Doğrulama başarılıysa, kullanıcı bilgilerini socket nesnesine ekle
            socket.user = decoded; 
            next();
        });
    });

    io.on('connection', (socket) => {
        // Artık `socket.user` üzerinden kullanıcı bilgilerine erişebiliriz.
        const { userId, username } = socket.user || {};
        console.log(`🔌 WebSocket Kullanıcısı Bağlandı: ID=${socket.id}, UserID=${userId}, Username=${username}`);

        // Metin tabanlı sohbet odaları için
        socket.on('join_chat_room', (roomId) => {
            socket.join(roomId);
            console.log(`💬 Kullanıcı ${socket.id} (${username}), metin sohbeti için '${roomId}' odasına katıldı.`);
        });

        socket.on('leave_chat_room', (roomId) => {
            socket.leave(roomId);
            console.log(`💬 Kullanıcı ${socket.id} (${username}), metin sohbeti için '${roomId}' odasından ayrıldı.`);
        });

        // WebRTC için mevcut olaylar... (Bu kısım aynı kalır)
        socket.on('join room', (roomID) => {
             console.log(`[WebRTC] Kullanıcı ${socket.id} ("${userId}"), "${roomID}" odasına katılmaya çalışıyor.`);
             //...
        });
        
        // ... (diğer WebRTC olayları)

        socket.on('disconnect', () => {
            console.log(`❌ WebSocket Kullanıcısı Ayrıldı: ID=${socket.id}, UserID=${userId}`);
            // ... (mevcut disconnect mantığı)
        });
    });
}

module.exports = initializeSignalingServer;