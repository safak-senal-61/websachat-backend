// public/script.js

const socket = io(); // Kendi sunucumuza bağlanıyoruz
const myVideo = document.getElementById('myVideo');
const peerVideo = document.getElementById('peerVideo');
const statusDiv = document.getElementById('status');
const roomID = "genel-oda"; // Tüm kullanıcılar bu odaya katılır

let myStream;
let peer;

// Peer bağlantısını ve ilgili UI elemanlarını temizleyen fonksiyon
function cleanupPeer() {
    if (peer) {
        peer.destroy();
        peer = null;
    }
    if (peerVideo.srcObject) {
        peerVideo.srcObject.getTracks().forEach(track => track.stop());
        peerVideo.srcObject = null;
    }
    statusDiv.innerText = 'Bağlantı koptu. Yeni bir kullanıcı bekleniyor...';
    console.log('Peer bağlantısı temizlendi.');
}

// Peer olaylarını (events) ayarlayan yardımcı fonksiyon
function setupPeerEvents(p) {
    p.on('error', err => {
        console.error('Peer hatası:', err);
        cleanupPeer();
    });

    p.on('connect', () => {
        console.log('✅ PEER BAĞLANTISI KURULDU!');
        statusDiv.innerText = 'Bağlantı kuruldu!';
    });

    p.on('stream', (stream) => {
        console.log('➡️ Karşıdan video akışı alındı!');
        peerVideo.srcObject = stream;
    });

    p.on('close', () => {
        console.log('Peer bağlantısı kapandı (close olayı).');
        cleanupPeer();
    });
}

// 1. Adım: Kullanıcının kamera ve mikrofonuna erişim
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        myStream = stream;
        myVideo.srcObject = stream;
        socket.emit('join room', roomID);
    })
    .catch(err => {
        console.error("Kamera erişim hatası:", err);
        alert("Kamera ve mikrofon erişimine izin vermelisiniz.");
    });

// 2. Adım: Odaya giren İKİNCİ kişi biz isek (Başlatıcı - Initiator)
socket.on('other user', (otherUserID) => {
    console.log(`Diğer kullanıcı ("${otherUserID}") odada. Bağlantıyı ben başlatıyorum.`);
    statusDiv.innerText = 'Diğer kullanıcı bulundu, bağlantı kuruluyor...';
    if (peer) return;

    peer = new SimplePeer({
        initiator: true,
        trickle: false, // Basitlik için kapalı
        stream: myStream,
    });

    peer.on('signal', (data) => {
        socket.emit('offer', {
            target: otherUserID,
            caller: socket.id,
            signal: data,
        });
    });

    setupPeerEvents(peer);
});

// 3. Adım: Odaya giren İLK kişi biz isek ve bize bir "teklif" geldiğinde
socket.on('offer', (payload) => {
    console.log(`Gelen teklif (offer) alınıyor from "${payload.caller}".`);
    statusDiv.innerText = 'Gelen bağlantı isteği kabul ediliyor...';
    if (peer) return;

    peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: myStream,
    });

    peer.signal(payload.signal);

    peer.on('signal', (data) => {
        socket.emit('answer', {
            target: payload.caller,
            caller: socket.id,
            signal: data,
        });
    });

    setupPeerEvents(peer);
});

// 4. Adım: Gönderdiğimiz teklife "cevap" geldiğinde
socket.on('answer', (payload) => {
    console.log(`Cevap (answer) alındı from "${payload.caller}".`);
    if (peer) {
        peer.signal(payload.signal);
    }
});

// 5. Adım: Karşıdaki kullanıcı ayrıldığında
socket.on('peer disconnected', () => {
    console.log('Eşleştiğiniz kullanıcı odadan ayrıldı.');
    cleanupPeer();
});

// 6. Adım: Oda doluysa
socket.on('room full', () => {
    alert("Oda dolu. Lütfen daha sonra tekrar deneyin.");
    statusDiv.innerText = 'Oda dolu, bağlantı kurulamadı.';
});