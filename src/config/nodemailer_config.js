// nodemailer_config.js

// Bu dosya, Nodemailer için yapılandırma seçeneklerini içerir.
// Gerçek bir uygulamada, hassas bilgiler (kullanıcı adı, şifre) .env dosyasından okunmalıdır.

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config(); // .env dosyasındaki değişkenleri yükle

const emailProvider = process.env.EMAIL_PROVIDER || 'mailtrap'; // Varsayılan olarak mailtrap

let transportOptions;

if (emailProvider.toLowerCase() === 'sendgrid') {
  // SendGrid için yapılandırma
  if (!process.env.SENDGRID_API_KEY) {
    console.warn(
      'UYARI: SendGrid e-posta sağlayıcısı seçildi ancak SENDGRID_API_KEY ortam değişkeni ayarlanmadı. E-posta gönderimi başarısız olabilir.'
    );
  }
  transportOptions = {
    host: 'smtp.sendgrid.net',
    port: 587, // Veya 465 (SSL/TLS için) veya 25
    secure: false, // true for 465, false for other ports (STARTTLS için false)
    auth: {
      user: 'apikey', // SendGrid için bu her zaman 'apikey' olmalıdır
      pass: process.env.SENDGRID_API_KEY, // SendGrid API Anahtarınız
    },
  };
  console.log('Nodemailer SendGrid sağlayıcısı ile yapılandırıldı.');
} else if (emailProvider.toLowerCase() === 'gmail') {
  // Gmail için yapılandırma
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.warn(
      'UYARI: Gmail e-posta sağlayıcısı seçildi ancak GMAIL_USER veya GMAIL_PASS ortam değişkenleri ayarlanmadı. E-posta gönderimi başarısız olabilir.'
    );
  }
  transportOptions = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  };
  console.log('Nodemailer Gmail sağlayıcısı ile yapılandırıldı.');
} else {
  // Mailtrap (veya varsayılan) için yapılandırma
  if (
    !process.env.MAILTRAP_HOST ||
    !process.env.MAILTRAP_PORT ||
    !process.env.MAILTRAP_USER ||
    !process.env.MAILTRAP_PASS
  ) {
    console.warn(
      'UYARI: Mailtrap e-posta sağlayıcısı seçildi ancak MAILTRAP_* ortam değişkenlerinden biri veya birkaçı ayarlanmadı. E-posta gönderimi başarısız olabilir.'
    );
  }
  transportOptions = {
    host: process.env.MAILTRAP_HOST,
    port: parseInt(process.env.MAILTRAP_PORT, 10),
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  };
  console.log('Nodemailer Mailtrap sağlayıcısı ile yapılandırıldı.');
}

const transporter = nodemailer.createTransport(transportOptions);

const config = {
  defaultFrom: process.env.EMAIL_FROM || '"WebSaChat No-Reply" help@websachat.me',
};

module.exports = {
  transporter,
  config,
};
