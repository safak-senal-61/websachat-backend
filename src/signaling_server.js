// src/signaling_server.js

function initializeSignalingServer(io) {
    // rooms nesnesi WebRTC için kalabilir, ancak yeni mantık için kullanmayacağız.
    const rooms = {}; 

    io.on('connection', (socket) => {
        // Kullanıcının kimliğini ve bilgilerini bağlantı anında alalım.
        // Bu bilgiler, frontend tarafından bağlantı sırasında query olarak gönderilmelidir.
        const { userId, username } = socket.handshake.query;
        console.log(`✅ WebSocket Kullanıcısı Bağlandı: ID=${socket.id}, UserID=${userId}, Username=${username}`);

        // 1. KULLANICININ SOHBET ODALARINA KATILMASI
        // Client (frontend) bağlandığında, aktif olduğu tüm sohbet odalarına katılması için bu olayı dinler.
        socket.on('join-conversation', (conversationId) => {
            socket.join(conversationId);
            console.log(`[Socket] Kullanıcı ${username} (${userId}), '${conversationId}' odasına katıldı.`);
        });

        // 2. YAZIYOR... GÖSTERGESİ (TYPING INDICATOR)
        // Kullanıcı yazmaya başladığında client bu olayı tetikler.
        socket.on('typing_start', ({ conversationId }) => {
            // Bilgiyi, aynı odadaki diğer kullanıcılara göndeririz.
            socket.to(conversationId).emit('user_typing_start', {
                userId,
                username,
                conversationId,
            });
        });

        // Kullanıcı yazmayı bıraktığında client bu olayı tetikler.
        socket.on('typing_stop', ({ conversationId }) => {
            // Bilgiyi, aynı odadaki diğer kullanıcılara göndeririz.
            socket.to(conversationId).emit('user_typing_stop', {
                userId,
                username,
                conversationId,
            });
        });

        // WebRTC için mevcut olaylar (Bunlar olduğu gibi kalabilir)
        socket.on('join room', (roomID) => {
            console.log(`[WebRTC] Kullanıcı ${socket.id} ("${userId}"), "${roomID}" odasına katılmaya çalışıyor.`);
            if (!rooms[roomID]) rooms[roomID] = [];
            if (rooms[roomID].length >= 2) {
                socket.emit('room full');
                return;
            }
            const otherUserSocketId = rooms[roomID][0];
            rooms[roomID].push(socket.id);
            if (otherUserSocketId) {
                socket.emit('other user', otherUserSocketId);
                socket.to(otherUserSocketId).emit('user joined', { newUserID: socket.id });
            }
        });
        
        socket.on('offer', (payload) => io.to(payload.target).emit('offer', payload));
        socket.on('answer', (payload) => io.to(payload.target).emit('answer', payload));
        socket.on('ice-candidate', (payload) => io.to(payload.target).emit('ice-candidate', payload));
        
        // Bağlantı kesildiğinde kullanıcıyı tüm odalardan çıkar.
        socket.on('disconnect', () => {
            console.log(`❌ WebSocket Kullanıcısı Ayrıldı: ID=${socket.id}, UserID=${userId}`);
            // WebRTC odalarından temizleme
            for (const roomID in rooms) {
                const index = rooms[roomID].indexOf(socket.id);
                if (index !== -1) {
                    rooms[roomID].splice(index, 1);
                    if (rooms[roomID].length > 0) {
                        io.to(rooms[roomID][0]).emit('peer disconnected');
                    }
                }
            }
        });
    });
}

module.exports = initializeSignalingServer;