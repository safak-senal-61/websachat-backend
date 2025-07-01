// src/server.js

require('dotenv').config();
const http = require('http');
const { Server } = require("socket.io");
const { app, corsOptions } = require('./app');
const initializeSignalingServer = require('./signaling_server');

const PORT = process.env.PORT || 3000;

async function main() {
    try {
        console.log('🏁 Sunucu başlatılıyor...');

        const server = http.createServer(app);

        // --- GÜNCELLENMİŞ SOCKET.IO YAPILANDIRMASI ---
        const io = new Server(server, {
            // Socket.IO için CORS ayarlarını Express ile aynı yapılandırmadan alıyoruz.
            cors: corsOptions,
            // Proxy arkasında doğru çalışması için 'polling'i de eklemek iyi bir pratiktir.
            // Socket.IO önce websocket ile bağlanmaya çalışır, olmazsa polling'e düşer.
            transports: ['websocket', 'polling'], 
        });

        initializeSignalingServer(io);
        app.set('io', io);

        server.listen(PORT, '0.0.0.0', () => {
            const baseUrl = `http://localhost:${PORT}`;
            console.log("====================================================");
            console.log(`🚀 HTTP ve WebSocket sunucusu ${PORT} portunda çalışıyor.`);
            console.log("----------------------------------------------------");
            console.log(`🏠 Görüntülü Sohbet Sayfası: ${baseUrl}/`);
            console.log(`📚 API Dokümantasyonu: ${baseUrl}/api-docs`);
            console.log("====================================================");
        });

    } catch (error) {
        console.error('❌ Sunucu başlatılırken kritik bir hata oluştu:', error);
        process.exit(1);
    }
}

function shutdown(signal) {
    console.log(`\n🔌 ${signal} sinyali alındı. Sunucu kapatılıyor...`);
    process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

main();