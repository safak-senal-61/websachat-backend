// src/controllers/agora/token_controller.js
const { RtcTokenBuilder, RtcRole } = require('agora-token');
const Response = require('../../utils/responseHandler');

// Sunucu hafızasında oda durumunu tutmak için
const rooms = {};

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

/**
 * @description Agora için bir RTC token'ı üretir ve kullanıcıyı odaya kaydeder.
 */
exports.getToken = (req, res) => {
    const { channelName, uid } = req.query;

    if (!APP_ID || !APP_CERTIFICATE) {
        console.error('HATA: AGORA_APP_ID veya AGORA_APP_CERTIFICATE ayarlanmamış.');
        return Response.internalServerError(res, 'Agora yapılandırması sunucuda eksik.');
    }

    if (!channelName || !uid) {
        return Response.badRequest(res, 'channelName ve uid parametreleri gereklidir.');
    }

    // Resepsiyonist Mantığı
    if (!rooms[channelName]) {
        rooms[channelName] = [];
    }
    if (!rooms[channelName].includes(uid)) {
        rooms[channelName].push(uid);
    }
    console.log(`AKTİF ODA: Kanal='${channelName}', Katılımcılar=[${rooms[channelName].join(', ')}]`);

    const userUid = 0; // Herkese açık token için UID 0 olmalıdır.
    const expireTime = 3600; // 1 saat
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;
    const role = RtcRole.PUBLISHER;

    try {
        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            userUid,
            role,
            privilegeExpireTime
        );

        return res.json({ token: token, appId: APP_ID });

    } catch (error) {
        console.error("Agora token üretme hatası:", error);
        return Response.internalServerError(res, 'Sunucuda token üretilirken bir hata oluştu.');
    }
};
