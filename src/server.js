// src/main.js

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
        const io = new Server(server, {
            cors: corsOptions,
            pingTimeout: 60000,
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