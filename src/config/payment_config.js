// src/config/payment_config.js
const Iyzipay = require('iyzipay');
const dotenv = require('dotenv');

dotenv.config(); // .env dosyasındaki değişkenleri yükle

// Iyzipay yapılandırması
const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com' // Test için sandbox, canlı için api.iyzipay.com
});

// Ödeme yapılandırma ayarları
const paymentConfig = {
    callbackUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/subscriptions/callback`, // Ödeme sonrası dönüş URL'i
    currency: 'TRY', // Varsayılan para birimi
    locale: 'tr', // Varsayılan dil
    installmentCount: 1, // Varsayılan taksit sayısı (tek çekim)
    paymentGroup: 'SUBSCRIPTION', // Ödeme grubu
    // Diğer ödeme yapılandırma ayarları buraya eklenebilir
};

module.exports = {
    iyzipay,
    paymentConfig
};