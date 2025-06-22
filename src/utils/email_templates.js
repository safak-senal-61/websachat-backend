// src/utils/email_templates.js

/**
 * Genel e-posta şablonu oluşturucu.
 * @param {string} title - E-postanın ana başlığı (banner üzerinde)
 * @param {string} [preheader] - E-posta istemcilerinde önizleme metni (isteğe bağlı)
 * @param {string} greeting - Selamlama mesajı (örn: Merhaba Zekî,)
 * @param {string} mainMessage - E-postanın ana içeriği (HTML destekler)
 * @param {string} buttonText - Buton üzerindeki yazı
 * @param {string} buttonLink - Butonun yönlendireceği URL
 * @param {string} buttonColor - Butonun arka plan rengi (hex kodu)
 * @param {string} [note] - Ana mesajdan sonraki küçük not (isteğe bağlı)
 * @param {string} [bannerColor] - Üst banner'ın arka plan rengi (hex kodu, varsayılan #007aff)
 * @returns {string} Oluşturulan HTML e-posta içeriği
 */
function createBaseEmailTemplate({
  title,
  preheader = '',
  greeting,
  mainMessage,
  buttonText,
  buttonLink,
  buttonColor,
  note = '',
  bannerColor = '#007aff', // Varsayılan mavi banner
}) {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Websachat</title>
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
  <style>
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif; 
      
      color: #ffffff; 
      line-height: 1.6;
      -webkit-font-smoothing: antialiased; 
      -moz-osx-font-smoothing: grayscale;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .email-wrapper {
      width: 100%;
     
      padding: 20px 0;
    }
    
    .email-container { 
      max-width: 480px; 
      width: 100%;
      margin: 0 auto; 
      background-color: #1c1c1e; 
      border-radius: 12px; 
      overflow: hidden; 
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 1px solid #2c2c2e;
    }
    
    .email-header { 
      background: linear-gradient(135deg, ${bannerColor} 0%, ${adjustColor(bannerColor, -20)} 100%);
      padding: 32px 24px; 
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .email-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%);
      pointer-events: none;
    }
    
    .email-header h1 { 
      position: relative;
      z-index: 1;
      color: white; 
      font-size: 24px; 
      font-weight: 700; 
      letter-spacing: -0.02em;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .email-body { 
      padding: 32px 24px; 
      background-color: #1c1c1e;
    }
    
    .greeting { 
      font-size: 18px;
      font-weight: 600; 
      color: #ffffff;
      margin-bottom: 24px;
      letter-spacing: -0.01em;
    }
    
    .email-body p { 
      font-size: 16px; 
      color: #e5e5e7;
      margin-bottom: 20px;
      line-height: 1.6;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .email-body p:last-of-type {
      margin-bottom: 32px;
    }
    
    .button-container { 
      text-align: center; 
      margin: 32px 0;
    }
    
    .button { 
      background: linear-gradient(135deg, ${buttonColor} 0%, ${adjustColor(buttonColor, -15)} 100%);
      color: white !important; 
      text-decoration: none; 
      padding: 16px 32px; 
      border-radius: 12px; 
      display: inline-block; 
      font-weight: 600; 
      font-size: 16px; 
      border: none; 
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 16px rgba(${hexToRgb(buttonColor)}, 0.3);
      letter-spacing: -0.01em;
      min-width: 200px;
      text-align: center;
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(${hexToRgb(buttonColor)}, 0.4);
    }
    
    .note { 
      font-size: 14px; 
      color: #8e8e93; 
      margin-top: 24px;
      padding: 16px;
      background-color: #2c2c2e;
      border-radius: 8px;
      border-left: 3px solid ${buttonColor};
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .email-footer { 
      text-align: center; 
      padding: 24px; 
      font-size: 13px; 
      color: #8e8e93; 
      background-color: #161618;
      border-top: 1px solid #2c2c2e;
    }
    
    .email-footer a {
      color: ${buttonColor};
      text-decoration: none;
    }
    
    /* Mobil uyumluluk */
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 10px;
      }
      
      .email-container {
        margin: 0 10px;
        border-radius: 8px;
      }
      
      .email-header {
        padding: 24px 20px;
      }
      
      .email-header h1 {
        font-size: 20px;
      }
      
      .email-body {
        padding: 24px 20px;
      }
      
      .greeting {
        font-size: 16px;
      }
      
      .email-body p {
        font-size: 15px;
      }
      
      .button {
        padding: 14px 24px;
        font-size: 15px;
        min-width: 180px;
        width: 100%;
        max-width: 280px;
      }
      
      .note {
        font-size: 13px;
        padding: 12px;
      }
      
      .email-footer {
        padding: 20px 16px;
        font-size: 12px;
      }
    }
    
    /* Dark mode support için e-posta istemcileri */
    @media (prefers-color-scheme: dark) {
      .email-container {
        border-color: #3a3a3c;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <table width="100%" cellpadding="0" cellspacing="0"  margin: 0; padding: 0;">
      <tr>
        <td align="center" style="padding: 20px 10px;">
          <div class="email-container">
            ${preheader ? `<div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
            
            <div class="email-header">
              <h1>${title}</h1>
            </div>
            
            <div class="email-body">
              <div class="greeting">${greeting}</div>
              <div class="main-content">
                ${mainMessage}
              </div>
              
              <div class="button-container">
                <a href="${buttonLink}" class="button" style="background: linear-gradient(135deg, ${buttonColor} 0%, ${adjustColor(buttonColor, -15)} 100%); color: white !important; text-decoration: none;">${buttonText}</a>
              </div>
              
              ${note ? `<div class="note">${note}</div>` : ''}
            </div>
            
            <div class="email-footer">
              © ${new Date().getFullYear()} <strong>Websachat</strong>. Tüm hakları saklıdır.<br>
              <a href="#" style="color: ${buttonColor};">Abonelikten çık</a> | <a href="#" style="color: ${buttonColor};">Gizlilik Politikası</a>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
}

// Yardımcı fonksiyonlar
function adjustColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
    '0, 122, 255';
}

// Şifre Sıfırlama Şablonu
function getPasswordResetTemplate(userName, resetLink) {
  return createBaseEmailTemplate({
    title: 'Şifre Sıfırlama Talebi',
    preheader: 'Websachat şifrenizi güvenli bir şekilde sıfırlayın.',
    greeting: `Merhaba ${userName},`,
    mainMessage: `
      <p>Hesabınız için bir şifre sıfırlama talebi aldık. Şifrenizi güvenli bir şekilde sıfırlamak için aşağıdaki butona tıklayabilirsiniz.</p>
      <p>Eğer bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın. Hesabınız güvende kalacaktır.</p>
    `,
    buttonText: 'Şifremi Güvenle Sıfırla',
    buttonLink: resetLink,
    buttonColor: '#007aff',
    note: '🔒 Bu şifre sıfırlama bağlantısı güvenlik nedeniyle 1 saat süreyle geçerlidir. Bağlantı kullanıldıktan sonra otomatik olarak geçersiz hale gelecektir.',
    bannerColor: '#007aff',
  });
}

// Hoş Geldin E-postası Şablonu
function getWelcomeEmailTemplate(userName, activationLink) {
  return createBaseEmailTemplate({
    title: 'Websachat\'a Hoş Geldiniz!',
    preheader: `${userName}, Websachat topluluğuna katıldığınız için teşekkürler!`,
    greeting: `Merhaba ${userName},`,
    mainMessage: `
      <p><strong>Websachat dünyasına hoş geldiniz!</strong> 🎉 Sizi aramızda görmekten büyük mutluluk duyuyoruz.</p>
      <p>Başlamak için hesabınızı etkinleştirmeniz gerekiyor. Lütfen aşağıdaki butona tıklayarak e-posta adresinizi doğrulayın ve hesabınızı aktif hale getirin:</p>
      <p>Hesabınızı etkinleştirdikten sonra tüm premium özelliklerimize erişebilir, topluluğumuzla etkileşime geçebilir ve Websachat deneyiminin tadını çıkarabilirsiniz.</p>
    `,
    buttonText: 'Hesabımı Etkinleştir',
    buttonLink: activationLink,
    buttonColor: '#34c759',
    note: '✨ Bu etkinleştirme bağlantısı 24 saat süreyle geçerlidir. Herhangi bir sorunuz olursa destek ekibimiz size yardımcı olmaktan memnuniyet duyar.',
    bannerColor: '#34c759',
  });
}

// Hesap Aktifleştirme (Yeniden Gönderim) Şablonu
function getAccountActivationTemplate(userName, activationLink) {
  return createBaseEmailTemplate({
    title: 'Hesap Etkinleştirme',
    preheader: 'Websachat hesabınızı etkinleştirin ve tüm özelliklere erişin.',
    greeting: `Merhaba ${userName},`,
    mainMessage: `
      <p>Websachat hesabınızı henüz etkinleştirmediğinizi fark ettik. 😊</p>
      <p>Tüm özelliklerimize erişebilmek ve topluluğumuzun bir parçası olabilmek için lütfen hesabınızı etkinleştirin.</p>
      <p>Etkinleştirme işlemi sadece birkaç saniye sürer ve ardından Websachat'in sunduğu tüm imkanlardan faydalanabilirsiniz.</p>
    `,
    buttonText: 'Hesabımı Şimdi Etkinleştir',
    buttonLink: activationLink,
    buttonColor: '#ff9500',
    note: '🔄 Eğer hesabınızı zaten etkinleştirdiyseniz veya bu e-postayı yanlışlıkla aldıysanız, lütfen dikkate almayın. Teknik destek için bize ulaşabilirsiniz.',
    bannerColor: '#ff9500',
  });
}

// Başarılı Kayıt Onayı Şablonu
function getRegistrationSuccessTemplate(userName) {
  return createBaseEmailTemplate({
    title: 'Kayıt İşlemi Tamamlandı!',
    preheader: 'Websachat hesabınız başarıyla oluşturuldu.',
    greeting: `Tebrikler ${userName}! 🎉`,
    mainMessage: `
      <p><strong>Websachat hesabınız başarıyla oluşturuldu!</strong></p>
      <p>Artık topluluğumuzun bir parçasısınız. Websachat'te neler yapabileceğinizi keşfetmeye başlayabilirsiniz:</p>
      <p>• 💬 Diğer kullanıcılarla sohbet edin<br>
      • 🌟 İlginç içerikleri keşfedin<br>
      • 🤝 Yeni arkadaşlıklar kurun<br>
      • 📱 Mobil uygulamımızı indirin</p>
    `,
    buttonText: 'Websachat\'i Keşfet',
    buttonLink: 'https://websachat.com/dashboard',
    buttonColor: '#5856d6',
    note: '💡 İpucu: Profilinizi tamamlayarak daha iyi bir deneyim yaşayabilir ve daha fazla kişiyle bağlantı kurabilirsiniz.',
    bannerColor: '#5856d6',
  });
}

// E-posta Değişikliği Onayı Şablonu
function getEmailChangeConfirmationTemplate(userName, newEmail, confirmationLink) {
  return createBaseEmailTemplate({
    title: 'E-posta Değişikliği Onayı',
    preheader: 'Yeni e-posta adresinizi doğrulayın.',
    greeting: `Merhaba ${userName},`,
    mainMessage: `
      <p>Hesabınızla ilişkilendirilmiş e-posta adresini <strong>${newEmail}</strong> olarak değiştirmek istediğinizi bildirdiniz.</p>
      <p>Bu değişikliği onaylamak için lütfen aşağıdaki butona tıklayın. Onayladıktan sonra tüm bildirimleri yeni e-posta adresinize alacaksınız.</p>
      <p>Eğer bu değişikliği siz yapmadıysanız, lütfen derhal destek ekibimizle iletişime geçin.</p>
    `,
    buttonText: 'E-posta Değişikliğini Onayla',
    buttonLink: confirmationLink,
    buttonColor: '#ff3b30',
    note: '🔒 Bu onay bağlantısı güvenlik nedeniyle 2 saat süreyle geçerlidir. İşlem tamamlandıktan sonra eski e-posta adresinize de bilgilendirme gönderilecektir.',
    bannerColor: '#ff3b30',
  });
}

module.exports = {
  getPasswordResetTemplate,
  getWelcomeEmailTemplate,
  getAccountActivationTemplate,
  getRegistrationSuccessTemplate,
  getEmailChangeConfirmationTemplate,
};