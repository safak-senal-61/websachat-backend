// src/utils/mailer.js
// Nodemailer konfigürasyonunu ayrı bir dosyadan import et
const { transporter, config: emailConfig } = require('../config/nodemailer_config'); // << YOLU KONTROL ET
// E-posta şablonlarını import et
const {
  getPasswordResetTemplate,
  getWelcomeEmailTemplate,
  getAccountActivationTemplate,
} = require('./email_templates');

/**
 * Genel e-posta gönderme fonksiyonu.
 * @param {string} to Alıcı e-posta adresi.
 * @param {string} subject E-postanın konusu.
 * @param {string} htmlContent HTML formatında e-posta içeriği.
 * @param {string} [textContent] Düz metin formatında e-posta içeriği (isteğe bağlı).
 */
const sendEmail = async (to, subject, htmlContent, textContent = '') => {
  // Transporter'ın nodemailer_config.js'de zaten oluşturulup oluşturulmadığını kontrol etmeye gerek yok,
  // eğer orada bir hata olursa uygulama zaten başlarken loglanır veya hata verir.
  // Ancak yine de bir kontrol eklenebilir, özellikle config dosyası dinamikse.
  if (!transporter) {
    const errorMessage = 'E-posta gönderilemiyor: Nodemailer transporter yapılandırılmamış veya yüklenememiş. Lütfen nodemailer_config.js dosyasını kontrol edin.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const mailOptions = {
    from: emailConfig.defaultFrom, // nodemailer_config.js'den gelen varsayılan gönderici
    to: to,
    subject: subject,
    text: textContent || htmlContent.replace(/<[^>]*>?/gm, ''), // Düz metin versiyonu
    html: htmlContent,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log(`E-posta başarıyla gönderildi: Alıcı: ${to}, Konu: "${subject}", Mesaj ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`E-posta gönderilemedi: Alıcı: ${to}, Konu: "${subject}" - Hata Detayları:`, error);
    // Hatanın nedenini daha iyi anlamak için error objesini loglamak önemli.
    // SendGrid bazen daha detaylı hata mesajları dönebilir.
    if (error.responseCode === 550 || (error.response && error.response.includes('recipient does not exist'))) {
        throw new Error(`Belirtilen e-posta adresi (${to}) geçersiz veya mevcut değil.`);
    } else if (error.code === 'EENVELOPE' || error.responseCode === 553) {
        throw new Error(`Gönderici e-posta adresi (${emailConfig.defaultFrom}) geçersiz veya doğrulanmamış.`);
    } else if (error.response && error.response.includes('Authentication credentials invalid')) {
        throw new Error('SendGrid API anahtarı geçersiz veya yetkilendirme hatası.');
    }
    throw new Error(`E-posta gönderimi sırasında bir hata oluştu: ${error.message}`);
  }
};

/**
 * Yeni kullanıcı için hoş geldin ve hesap aktifleştirme e-postası gönderir.
 * @param {string} to Alıcı e-posta adresi.
 * @param {string} userName Kullanıcının adı/kullanıcı adı.
 * @param {string} activationLink Hesabı aktifleştirme bağlantısı.
 */
const sendWelcomeAndActivationEmail = async (to, userName, activationLink) => {
  const htmlContent = getWelcomeEmailTemplate(userName, activationLink);
  // Konu, şablondan gelen title ile veya burada sabit bir şekilde ayarlanabilir.
  const subject = `Websachat'a Hoş Geldiniz, ${userName}! Hesabınızı Etkinleştirin`;
  await sendEmail(to, subject, htmlContent);
};

/**
 * Hesap aktifleştirme linkini (yeniden) gönderir.
 * @param {string} to Alıcı e-posta adresi.
 * @param {string} userName Kullanıcının adı/kullanıcı adı.
 * @param {string} activationLink Hesabı aktifleştirme bağlantısı.
 */
const sendAccountActivationEmail = async (to, userName, activationLink) => {
  const htmlContent = getAccountActivationTemplate(userName, activationLink);
  const subject = `Websachat Hesap Aktifleştirme İsteğiniz, ${userName}`;
  await sendEmail(to, subject, htmlContent);
};

/**
 * Şifre sıfırlama e-postası gönderir.
 * @param {string} to Alıcı e-posta adresi.
 * @param {string} userName Kullanıcının adı/kullanıcı adı.
 * @param {string} resetLink Şifre sıfırlama bağlantısı.
 */
const sendPasswordResetEmail = async (to, userName, resetLink) => {
  const htmlContent = getPasswordResetTemplate(userName, resetLink);
  const subject = `Websachat Şifre Sıfırlama Talebiniz, ${userName}`;
  await sendEmail(to, subject, htmlContent);
};

module.exports = {
  sendEmail,
  sendWelcomeAndActivationEmail,
  sendAccountActivationEmail,
  sendPasswordResetEmail,
};