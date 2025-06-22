// Configuration - Replace with your actual backend URL
const CONFIG = {
    API_BASE_URL: "https://3000-firebase-websachat-backend-1748272624869.cluster-6vyo4gb53jczovun3dxslzjahs.cloudworkstations.dev",
    LOGIN_PAGE_URL: "https://3000-firebase-websachat-web-1748782524865.cluster-3gc7bglotjgwuxlqpiut7yyqt4.cloudworkstations.dev/login", // <<< GÜNCELLENDİ
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

// DOM elements
const elements = {
    messageArea: null,
    statusIcon: null,
    loader: null,
    loginButton: null
};

// Initialize DOM elements
function initializeElements() {
    elements.messageArea = document.getElementById('messageArea');
    elements.statusIcon = document.getElementById('statusIcon');
    elements.loader = document.getElementById('loader');
    elements.loginButton = document.getElementById('loginButton');
}

// Update UI state
function updateUIState(state, message, showButton = false) {
    const { messageArea, statusIcon, loader, loginButton } = elements;

    if (loader) loader.style.display = 'none';

    if (statusIcon && messageArea) {
        const stateConfig = {
            success: { icon: '✅', class: 'success' },
            error: { icon: '❌', class: 'error' },
            warning: { icon: '⚠️', class: 'error' } // 'warning' için 'error' class'ı kullanılmış, isteğe bağlı 'warning' class'ı da eklenebilir.
        };

        const config = stateConfig[state];
        if (config) {
            statusIcon.textContent = config.icon;
            statusIcon.className = `icon ${config.class}`;
            messageArea.className = `message ${config.class}`;

            if (state === 'success') {
                statusIcon.classList.add('success-animation');
            }
        }

        messageArea.innerHTML = `<p>${message}</p>`;
    }

    if (loginButton && showButton) {
        loginButton.style.display = 'inline-block';
        loginButton.href = CONFIG.LOGIN_PAGE_URL;
    } else if (loginButton) {
        loginButton.style.display = 'none'; // Buton gösterilmeyecekse gizle
    }
}

// Get URL parameters safely
function getUrlParameter(name) {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    } catch (error) {
        console.error('Error parsing URL parameters:', error);
        updateUIState('error', 'URL parametreleri okunurken bir hata oluştu.');
        return null;
    }
}

// Make API request with retry logic
async function makeApiRequest(url, options = {}, retries = CONFIG.RETRY_ATTEMPTS) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                method: 'GET', // Varsayılan GET, ancak options ile override edilebilir
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(options.headers || {}) // options'dan gelen header'ları ekle/üzerine yaz
                },
                ...options // method, body vb. diğer options'ları ekle
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json(); // Sunucudan gelen JSON hatasını yakalamaya çalış
                } catch (e) {
                    errorData = { mesaj: response.statusText }; // JSON yoksa status text'i kullan
                }
                // Hata mesajını daha anlamlı hale getir
                throw new Error(`HTTP ${response.status}: ${errorData.mesaj || response.statusText}`);
            }

            // Yanıtın boş olup olmadığını kontrol et (örneğin 204 No Content)
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return await response.json();
            } else {
                return await response.text(); // Ya da response.text() eğer JSON beklenmiyorsa
            }
        } catch (error) {
            console.warn(`API request attempt ${i + 1} failed:`, error);

            if (i === retries - 1) {
                throw error; // Son denemede hatayı fırlat
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * (i + 1)));
        }
    }
}

// Main email verification function
async function verifyEmail() {
    if (!elements.messageArea) { // DOM hazır değilse erken çık
        console.warn("DOM elements not ready for verifyEmail.");
        return;
    }
    if (elements.loader) elements.loader.style.display = 'block'; // Başlangıçta loader'ı göster

    try {
        const token = getUrlParameter('token');

        if (!token) {
            updateUIState('warning',
                'Doğrulama token\'ı bulunamadı. Lütfen e-postanızdaki linki kontrol edin veya yeni bir doğrulama e-postası talep edin.'
            );
            return;
        }

        // Validate token format (basic check)
        if (token.length < 10) { // Bu kontrol isteğe bağlıdır, sunucu daha kapsamlı kontrol yapmalı
            updateUIState('error',
                'Geçersiz doğrulama token\'ı. Lütfen e-postanızdaki linki tekrar kontrol edin.'
            );
            return;
        }

        const apiUrl = `${CONFIG.API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;
        // makeApiRequest'e POST metodu ve token'ı body'de göndermek daha güvenli olabilir,
        // ancak mevcut backend GET bekliyorsa bu şekilde kalmalı.
        // Örneğin:
        // const result = await makeApiRequest(apiUrl, {
        //     method: 'POST',
        //     body: JSON.stringify({ token: token })
        // });
        const result = await makeApiRequest(apiUrl); // Mevcut GET isteği

        if (result && result.basarili) { // result'ın null/undefined olmadığını kontrol et
            const successMessage = result.mesaj || 'E-posta adresiniz başarıyla doğrulandı! Artık hesabınıza giriş yapabilirsiniz.';
            updateUIState('success', successMessage, true); // showButton = true

            // Optional: Auto-redirect after success
            setTimeout(() => {
                // elements.loginButton.href zaten updateUIState içinde CONFIG.LOGIN_PAGE_URL ile set edildi.
                if (elements.loginButton && elements.loginButton.href) {
                    window.location.href = elements.loginButton.href;
                } else {
                    // Fallback eğer buton bir şekilde set edilemediyse, doğrudan config'den al
                    window.location.href = CONFIG.LOGIN_PAGE_URL;
                }
            }, 3000);
        } else {
            const errorMessage = (result && result.mesaj) ? result.mesaj : 'E-posta doğrulaması başarısız oldu. Lütfen tekrar deneyin veya destek ile iletişime geçin.';
            updateUIState('error', errorMessage);

            // Handle expired token case
            if (result && result.mesaj && result.mesaj.toLowerCase().includes("süresi dolmuş")) {
                // TODO: "Yeniden Gönder" butonu veya talimatı eklenebilir.
                // updateUIState'e özel bir state (örn: 'expired_token') ekleyip
                // buna göre farklı bir buton göstermeyi düşünebilirsiniz.
            }
        }
    } catch (error) {
        console.error('Email verification error:', error);

        let errorMessage = 'E-posta doğrulaması sırasında bir hata oluştu. ';

        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            errorMessage += 'İnternet bağlantınızı kontrol edip tekrar deneyin.';
        } else if (error.message.startsWith('HTTP 5')) { // HTTP 5xx hataları için
            errorMessage += 'Sunucu geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
        } else if (error.message.startsWith('HTTP 4')) { // HTTP 4xx hataları (400, 401, 403, 404 vs.)
             errorMessage += 'İstek geçersiz veya yetkiniz yok. Token\'ı kontrol edin veya destek ile iletişime geçin.';
        }
        else {
            errorMessage += 'Lütfen daha sonra tekrar deneyin veya destek ile iletişime geçin.';
        }
        // Daha spesifik hata mesajı için:
        // errorMessage = error.message; // Doğrudan API'den veya fetch'ten gelen hatayı gösterir

        updateUIState('error', errorMessage);
    } finally {
        if (elements.loader) elements.loader.style.display = 'none'; // İşlem bitince loader'ı gizle
    }
}

// Initialize application
function initializeApp() {
    initializeElements();
    // DOM elementlerinin varlığını kontrol et
    if (elements.messageArea && elements.statusIcon && elements.loader && elements.loginButton) {
        verifyEmail();
    } else {
        console.error("Required DOM elements not found during initialization.");
        // Gerekli DOM elemanları yoksa kullanıcıya bir mesaj gösterilebilir
        const body = document.body;
        if (body) {
            body.innerHTML = "<p style='color: red; text-align: center; margin-top: 50px;'>Sayfa yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>";
        }
    }
}

// Event listeners
// DOMContentLoaded genellikle yeterlidir.
document.addEventListener('DOMContentLoaded', initializeApp);

// Fallback için document.readyState kontrolü çoğu modern tarayıcıda gereksizdir
// ancak eski tarayıcılar veya belirli senaryolar için kalabilir.
// Ancak, initializeApp zaten DOMContentLoaded içinde çağrıldığı için bu blok genellikle çalışmaz.
// if (document.readyState === 'loading') {
//     // Bu blok DOMContentLoaded'den önce çalışır, initializeApp zaten DOMContentLoaded'de çağrılıyor.
// } else {
//     // DOM zaten hazırsa (çok nadir bir durum, script en altta değilse)
//     // initializeApp(); // Bu, initializeApp'in iki kez çağrılmasına neden olabilir.
// }

// Handle page visibility changes (optional enhancement)
document.addEventListener('visibilitychange', function() {
    // Bu kısım, sayfa gizliyken doğrulama işleminin durup, görünür olunca devam etmesi için.
    // Ancak, mevcut verifyEmail() zaten sayfa yüklenince bir kere çalışıyor.
    // Eğer doğrulama süreci çok uzun sürüyorsa ve kullanıcı sekmeyi değiştiriyorsa anlamlı olabilir.
    // Mevcut senaryoda, `elements.statusIcon.className.includes('pending')` gibi bir "pending" state'imiz yok.
    // Belki loader görünürse tekrar denenebilir:
    if (!document.hidden && elements.loader && elements.loader.style.display === 'block') {
        // Henüz bir sonuç alınmadıysa ve sayfa tekrar görünür olduysa
        // console.log("Page became visible, re-checking verification status (if applicable).");
        // verifyEmail(); // Bu, token'ın tekrar tekrar gönderilmesine neden olabilir. Dikkatli kullanılmalı.
        // Genellikle bu tür bir mantık, WebSocket bağlantıları veya uzun süren polling işlemleri için daha uygundur.
    }
});