// src/services/iyzico_service.js
const Iyzipay = require('iyzipay');

const iyzico = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL
});

module.exports = iyzico;