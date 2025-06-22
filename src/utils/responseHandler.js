// src/utils/responseHandler.js

// BigInt'leri string'e çeviren replacer fonksiyonu
function replacer(key, value) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

const successResponse = (res, statusCode, message, data = null, meta = null) => {
  const responsePayload = {
    basarili: true,
    mesaj: message,
  };
  if (data !== null) {
    responsePayload.veri = data;
  }
  if (meta !== null) {
    responsePayload.meta = meta;
  }
  const jsonResponse = JSON.stringify(responsePayload, replacer);
  res.setHeader('Content-Type', 'application/json');
  return res.status(statusCode).send(jsonResponse);
};

const errorResponse = (res, statusCode, message, errors = null) => {
  const responsePayload = {
    basarili: false,
    mesaj: message,
  };
  if (errors !== null) {
    responsePayload.hatalar = errors;
  }
  const jsonResponse = JSON.stringify(responsePayload, replacer);
  res.setHeader('Content-Type', 'application/json');
  return res.status(statusCode).send(jsonResponse);
};

// Başarı durumları için yardımcı fonksiyonlar
const ok = (res, message, data, meta) => successResponse(res, 200, message, data, meta);
const created = (res, message, data) => successResponse(res, 201, message, data);
const noContent = (res) => {
  return res.status(204).send();
};

// Hata durumları için yardımcı fonksiyonlar (Türkçe mesajlarla)
const badRequest = (res, message, errors) => errorResponse(res, 400, message || 'Geçersiz istek.', errors);
const unauthorized = (res, message) => errorResponse(res, 401, message || 'Yetkisiz erişim. Lütfen giriş yapın.');
const paymentRequired = (res, message) => errorResponse(res, 402, message || 'Ödeme gerekli.');
const forbidden = (res, message) => errorResponse(res, 403, message || 'Yasaklandı. Bu kaynağa erişim izniniz yok.');
const notFound = (res, message) => errorResponse(res, 404, message || 'Kaynak bulunamadı.');
const conflict = (res, message, errors) => errorResponse(res, 409, message || 'Çakışma. Kaynak zaten mevcut veya bir çakışma durumu var.', errors);
const unprocessableEntity = (res, message, errors) => errorResponse(res, 422, message || 'İşlenemeyen varlık. Gönderilen veri doğrulanamadı.', errors);
const tooManyRequests = (res, message) => errorResponse(res, 429, message || 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.');
const internalServerError = (res, message, errors) => errorResponse(res, 500, message || 'Sunucu hatası. Beklenmedik bir sorun oluştu.', errors);
const notImplemented = (res, message) => errorResponse(res, 501, message || 'Bu özellik henüz implemente edilmedi.'); // <-- EKLENEN FONKSİYON
const serviceUnavailable = (res, message) => errorResponse(res, 503, message || 'Servis kullanılamıyor. Lütfen daha sonra tekrar deneyin.');

module.exports = {
  successResponse,
  errorResponse,
  ok,
  created,
  noContent,
  badRequest,
  unauthorized,
  paymentRequired,
  forbidden,
  notFound,
  conflict,
  unprocessableEntity,
  tooManyRequests,
  internalServerError,
  notImplemented, // <-- EXPORT'A EKLE
  serviceUnavailable,
};