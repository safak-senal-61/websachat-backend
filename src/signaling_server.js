// src/signaling_server.js

function initializeSignalingServer(io) {
    const rooms = {}; // Key: roomID, Value: [socket.id1, socket.id2]

    io.on('connection', (socket) => {
        console.log(`✅ Sinyal sunucusuna yeni bir kullanıcı bağlandı: ${socket.id}`);
        
        // Kullanıcının kimliğini ve ait olduğu odaları yönetmek için
        // Gerçek bir uygulamada, bu bilgi bir veritabanından veya Redis'ten alınabilir.
        const { userId } = socket.handshake.query;
        console.log(`Bağlanan kullanıcı ID'si: ${userId}`);

        socket.on('join room', (roomID) => {
            console.log(`Kullanıcı ${socket.id} ("${userId}"), "${roomID}" odasına katılmaya çalışıyor.`);
            socket.join(roomID); // Kullanıcıyı Socket.IO odasına ekle

            if (!rooms[roomID]) {
                rooms[roomID] = [];
            }

            if (rooms[roomID].length >= 2) {
                socket.emit('room full');
                console.log(`"${roomID}" odası dolu. Kullanıcı ${socket.id} reddedildi.`);
                return;
            }

            const otherUserSocketId = rooms[roomID][0];
            rooms[roomID].push(socket.id);
            
            console.log(`Kullanıcı ${socket.id}, "${roomID}" odasına katıldı. Odadakiler:`, rooms[roomID]);

            if (otherUserSocketId) {
                console.log(`Eşleşme bulundu: ${socket.id} (yeni) <-> ${otherUserSocketId} (mevcut)`);
                socket.emit('other user', otherUserSocketId);
                socket.to(otherUserSocketId).emit('user joined', { newUserID: socket.id });
            }
        });

        // --- YENİ EKLENDİ: Yazıyor... (Typing Indicator) Olayları ---
        
        // Bir kullanıcı yazmaya başladığında bu olay tetiklenir
        socket.on('typing_start', ({ conversationId }) => {
            // Yayını sadece aynı odadaki diğer kullanıcılara gönder
            socket.to(conversationId).emit('user_typing_start', {
                conversationId,
                userId: userId // Hangi kullanıcının yazdığı bilgisi
            });
        });

        // Bir kullanıcı yazmayı bıraktığında bu olay tetiklenir
        socket.on('typing_stop', ({ conversationId }) => {
            // Yayını sadece aynı odadaki diğer kullanıcılara gönder
            socket.to(conversationId).emit('user_typing_stop', {
                conversationId,
                userId: userId
            });
        });
        
        // --- YENİ KISIM SONU ---

        socket.on('offer', (payload) => {
            console.log(`'offer' sinyali ${payload.caller} -> ${payload.target}`);
            io.to(payload.target).emit('offer', payload);
        });

        socket.on('answer', (payload) => {
            console.log(`'answer' sinyali ${payload.caller} -> ${payload.target}`);
            io.to(payload.target).emit('answer', payload);
        });

        socket.on('ice-candidate', (payload) => {
            io.to(payload.target).emit('ice-candidate', payload);
        });

        socket.on('disconnect', () => {
            console.log(`❌ Kullanıcı ayrıldı: ${socket.id}`);
            for (const roomID in rooms) {
                const userIndex = rooms[roomID].indexOf(socket.id);
                if (userIndex !== -1) {
                    rooms[roomID].splice(userIndex, 1);
                    console.log(`Kullanıcı ${socket.id}, "${roomID}" odasından çıkarıldı.`);
                    
                    if (rooms[roomID].length > 0) {
                        const remainingUser = rooms[roomID][0];
                        io.to(remainingUser).emit('peer disconnected');
                    }
                    
                    if (rooms[roomID].length === 0) {
                        delete rooms[roomID];
                        console.log(`"${roomID}" odası boşaldığı için kapatıldı.`);
                    }
                    break;
                }
            }
        });
    });
}

module.exports = initializeSignalingServer;