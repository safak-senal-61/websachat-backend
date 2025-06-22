// src/signaling_server.js

function initializeSignalingServer(io) {
    const rooms = {}; // Key: roomID, Value: [socket.id1, socket.id2]

    io.on('connection', (socket) => {
        console.log(`✅ Sinyal sunucusuna yeni bir kullanıcı bağlandı: ${socket.id}`);

        socket.on('join room', (roomID) => {
            console.log(`Kullanıcı ${socket.id}, "${roomID}" odasına katılmaya çalışıyor.`);

            if (!rooms[roomID]) {
                rooms[roomID] = [];
            }

            // Sadece iki kişilik odalara izin ver
            if (rooms[roomID].length >= 2) {
                socket.emit('room full');
                console.log(`"${roomID}" odası dolu. Kullanıcı ${socket.id} reddedildi.`);
                return;
            }

            const otherUser = rooms[roomID][0]; // Odadaki (varsa) diğer kullanıcı
            rooms[roomID].push(socket.id);
            socket.join(roomID);

            console.log(`Kullanıcı ${socket.id}, "${roomID}" odasına katıldı. Odadakiler:`, rooms[roomID]);

            if (otherUser) {
                console.log(`Eşleşme bulundu: ${socket.id} (yeni) <-> ${otherUser} (mevcut)`);
                // Yeni kullanıcıya, odadaki mevcut kullanıcıyı bildir (bağlantıyı başlatması için)
                socket.emit('other user', otherUser);
                // Mevcut kullanıcıya, yeni bir kullanıcının katıldığını bildir
                socket.to(otherUser).emit('user joined', { newUserID: socket.id });
            }
        });

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