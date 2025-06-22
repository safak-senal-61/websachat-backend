// OAuth Callback Handler
(function() {
    'use strict';

    function showError(message) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    function getUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            accessToken: urlParams.get('accessToken'),
            refreshToken: urlParams.get('refreshToken'),
            accessExpiresIn: urlParams.get('accessExpiresIn'),
            refreshExpiresIn: urlParams.get('refreshExpiresIn'),
            user: urlParams.get('user'),
            error: urlParams.get('error')
        };
    }

    function saveTokens(accessToken, refreshToken, user) {
        try {
            // Tokens'ları localStorage'a kaydet
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', user);
            
            // Expiry time'ları da kaydet (opsiyonel)
            const now = new Date().getTime();
            localStorage.setItem('tokenTimestamp', now.toString());
            
            return true;
        } catch (error) {
            console.error('Token kaydetme hatası:', error);
            return false;
        }
    }

    function redirectToApp() {
        // Ana uygulamaya yönlendir
        window.location.href = '/'; // veya '/dashboard' gibi ana sayfa
    }

    function redirectToLogin(errorMessage) {
        // Login sayfasına hata mesajı ile yönlendir
        const encodedError = encodeURIComponent(errorMessage);
        window.location.href = `/login.html?error=${encodedError}`;
    }

    function processCallback() {
        try {
            const params = getUrlParams();

            // Hata kontrolü
            if (params.error) {
                showError('Giriş sırasında bir hata oluştu: ' + params.error);
                setTimeout(() => redirectToLogin(params.error), 3000);
                return;
            }

            // Gerekli parametrelerin kontrolü
            if (!params.accessToken || !params.refreshToken || !params.user) {
                const missingParams = [];
                if (!params.accessToken) missingParams.push('accessToken');
                if (!params.refreshToken) missingParams.push('refreshToken');
                if (!params.user) missingParams.push('user');
                
                const errorMsg = 'Eksik parametreler: ' + missingParams.join(', ');
                showError(errorMsg);
                setTimeout(() => redirectToLogin('callback_processing_failed'), 3000);
                return;
            }

            // User verisini parse et
            let userData;
            try {
                userData = JSON.parse(decodeURIComponent(params.user));
            } catch (parseError) {
                console.error('User verisi parse edilemedi:', parseError);
                showError('Kullanıcı verisi işlenemedi');
                setTimeout(() => redirectToLogin('user_data_parse_failed'), 3000);
                return;
            }

            // Token'ları kaydet
            const saveSuccess = saveTokens(params.accessToken, params.refreshToken, params.user);
            
            if (!saveSuccess) {
                showError('Token\'lar kaydedilemedi');
                setTimeout(() => redirectToLogin('token_save_failed'), 3000);
                return;
            }

            // Başarılı giriş mesajı
            document.querySelector('h3').textContent = 'Giriş başarılı!';
            document.querySelector('p').textContent = `Hoş geldin ${userData.nickname || userData.username}!`;

            // Ana sayfaya yönlendir
            setTimeout(redirectToApp, 1500);

        } catch (error) {
            console.error('Callback işleme hatası:', error);
            showError('Beklenmeyen bir hata oluştu: ' + error.message);
            setTimeout(() => redirectToLogin('unexpected_error'), 3000);
        }
    }

    // Sayfa yüklendiğinde callback'i işle
    document.addEventListener('DOMContentLoaded', processCallback);

    // Fallback: DOMContentLoaded çalışmazsa
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', processCallback);
    } else {
        processCallback();
    }

})();