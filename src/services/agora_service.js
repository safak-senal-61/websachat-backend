// src/services/agora_service.js
const { RtcTokenBuilder, RtcRole } = require('agora-token');

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

/**
 * Belirtilen kanal ve kullanıcı için bir Agora RTC token'ı üretir.
 * @param {string} channelName - Katılınacak kanalın adı.
 *- * @param {string | number} uid - Kanala katılan kullanıcının ID'si. Agora için numerik olması önerilir.
 * @param {number} expireTimeInSeconds - Token'ın geçerlilik süresi (saniye cinsinden). Varsayılan 1 saat.
 * @returns {string|null} Oluşturulan token veya hata durumunda null.
 */
const generateRtcToken = (channelName, uid, expireTimeInSeconds = 3600) => {
    if (!APP_ID || !APP_CERTIFICATE) {
        console.error('HATA: AGORA_APP_ID veya AGORA_APP_CERTIFICATE ortam değişkenleri ayarlanmamış.');
        return null;
    }

    const numericUid = isNaN(parseInt(uid)) ? 0 : parseInt(uid); // Agora genellikle sayısal UID bekler. 0 genel yayıncı/izleyici demektir.
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTimeInSeconds;
    const role = RtcRole.PUBLISHER; // Yayıncı rolü

    try {
        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            numericUid, // String yerine sayısal UID kullan
            role,
            privilegeExpireTime
        );
        console.log(`Agora Token üretildi: Kanal=${channelName}, UID=${numericUid}`);
        return token;
    } catch (error) {
        console.error("Agora token üretme hatası:", error);
        return null;
    }
};

module.exports = {
    generateRtcToken,
    agoraAppId: APP_ID,
};