// src/utils/oneSignal_sender.js
const https = require('https'); // Veya axios, node-fetch gibi bir kütüphane

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

/**
 * Belirli kullanıcılara veya segmentlere OneSignal push bildirimi gönderir.
 * @param {object} notificationData
 * @param {string[]} notificationData.include_player_ids - Hedef kullanıcıların OneSignal player ID'leri.
 * @param {object} notificationData.headings - Başlıklar (örn: {"en": "Yeni Mesaj", "tr": "Yeni Mesajınız Var"}).
 * @param {object} notificationData.contents - İçerikler (örn: {"en": "John'dan bir mesaj.", "tr": "Ahmet'ten bir mesajınız var."}).
 * @param {object} [notificationData.data] - Bildirime eklenecek ek veri (örn: {"postId": "123"}).
 * @param {string} [notificationData.url] - Bildirime tıklandığında açılacak URL (web push için).
 * @param {string[]} [notificationData.include_external_user_ids] - Eğer external_user_id kullanıyorsanız.
 * @param {string[]} [notificationData.included_segments] - "All", "Active Users" gibi segmentler.
 */
const sendPushNotification = async (notificationData) => {
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
        console.error("OneSignal APP ID veya REST API Key ayarlanmamış. Push bildirimi gönderilemiyor.");
        return Promise.reject(new Error("OneSignal yapılandırması eksik."));
    }

    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`
    };

    const options = {
        host: "onesignal.com",
        port: 443,
        path: "/notifications",
        method: "POST",
        headers: headers
    };

    const message = {
        app_id: ONESIGNAL_APP_ID,
        ...notificationData
        // Örnek:
        // headings: {"en": "Test Title"},
        // contents: {"en": "Test message"},
        // include_player_ids: ["player_id_1", "player_id_2"] // Veya include_external_user_ids
        // data: {"type": "new_message", "chatId": "xyz"} // Uygulama içi yönlendirme için ek veri
        // url: "https://myapp.com/chat/xyz" // Web push için
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (data) => {
                responseBody += data;
            });
            res.on('end', () => {
                try {
                    const parsedResponse = JSON.parse(responseBody);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log("OneSignal Push Bildirimi başarıyla gönderildi:", parsedResponse);
                        resolve(parsedResponse);
                    } else {
                        console.error("OneSignal Push Bildirimi gönderme hatası:", res.statusCode, parsedResponse);
                        reject(new Error(`OneSignal API Error: ${res.statusCode} - ${parsedResponse.errors?.join(', ') || responseBody}`));
                    }
                } catch (e) {
                    console.error("OneSignal yanıtı parse etme hatası:", e, responseBody);
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            console.error("OneSignal istek hatası:", e);
            reject(e);
        });

        req.write(JSON.stringify(message));
        req.end();
    });
};

module.exports = { sendPushNotification };