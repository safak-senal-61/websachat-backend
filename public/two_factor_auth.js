
    const API_BASE_URL = "https://3000-firebase-websachat-bacendgit-1750692398761.cluster-axf5tvtfjjfekvhwxwkkkzsk2y.cloudworkstations.dev";
    const twoFAStatusEl = document.getElementById('2faStatus');
    const btnToggle2FA = document.getElementById('btnToggle2FA');
    
    const enable2FASection = document.getElementById('enable2FASection');
    const qrCodeImageEl = document.getElementById('qrCodeImage');
    const secretKeyDisplayEl = document.getElementById('secretKeyDisplay');
    const verificationCodeInput = document.getElementById('verificationCode');
    const btnVerifyAndEnable = document.getElementById('btnVerifyAndEnable');
    const enableMessageEl = document.getElementById('enableMessage');
    let current2FASecret = ''; // enable-setup'tan gelen secret'ı saklamak için

    const disable2FASection = document.getElementById('disable2FASection');
    const disablePasswordInput = document.getElementById('disablePassword');
    const disable2FACodeInput = document.getElementById('disable2FACode');
    const btnConfirmDisable = document.getElementById('btnConfirmDisable');
    const disableMessageEl = document.getElementById('disableMessage');

    const backupCodesSection = document.getElementById('backupCodesSection');
    const btnGenerateBackupCodes = document.getElementById('btnGenerateBackupCodes');
    const backupCodeListEl = document.getElementById('backupCodeList');
    const backupMessageEl = document.getElementById('backupMessage');

    let is2FAEnabled = false;

    // Bearer token'ı localStorage'dan veya cookie'den al
    // Bu örnekte localStorage varsayılıyor. Gerçek uygulamada daha güvenli bir yöntem kullanın.
    const accessToken = localStorage.getItem('accessToken'); 

    if (!accessToken) {
        alert('Lütfen önce giriş yapın.');
        // window.location.href = '/login.html'; // Giriş sayfasına yönlendir
    }

    async function fetchWithAuth(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        };
        const mergedOptions = { ...defaultOptions, ...options };
        if (options.body) {
            mergedOptions.body = JSON.stringify(options.body);
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);
        return response.json();
    }

    function displayUIMessage(element, message, type) {
        element.textContent = message;
        element.className = `message ${type}`;
        element.style.display = 'block';
        setTimeout(() => { element.style.display = 'none'; }, 5000);
    }

    async function check2FAStatus() {
        try {
            // Kullanıcı bilgilerini çeken bir endpoint'e ihtiyacımız var
            // Bu endpoint `twoFactorEnabled` bilgisini dönmeli
            // Şimdilik varsayımsal bir /auth/me endpoint'i kullanalım
            const result = await fetchWithAuth('/auth/me'); // Bu endpoint'i oluşturmanız gerekir
            if (result.basarili && result.veri && result.veri.kullanici) {
                is2FAEnabled = result.veri.kullanici.twoFactorEnabled;
                twoFAStatusEl.textContent = is2FAEnabled ? 'Aktif' : 'Devre Dışı';
                btnToggle2FA.textContent = is2FAEnabled ? '2FA Devre Dışı Bırak' : '2FA Aktifleştir';
                if (is2FAEnabled) {
                    backupCodesSection.classList.remove('hidden');
                } else {
                    backupCodesSection.classList.add('hidden');
                }
            } else {
                twoFAStatusEl.textContent = 'Durum alınamadı.';
                console.error("Kullanıcı durumu alınamadı:", result.mesaj);
            }
        } catch (err) {
            twoFAStatusEl.textContent = 'Hata';
            console.error('2FA durumu kontrol edilirken hata:', err);
        }
    }
    
    btnToggle2FA.addEventListener('click', () => {
        if (is2FAEnabled) {
            disable2FASection.classList.toggle('hidden');
            enable2FASection.classList.add('hidden'); // Diğerini gizle
        } else {
            enable2FASection.classList.toggle('hidden');
            disable2FASection.classList.add('hidden'); // Diğerini gizle
            if (!enable2FASection.classList.contains('hidden')) {
                initiateEnable2FA();
            }
        }
    });

    async function initiateEnable2FA() {
        try {
            const result = await fetchWithAuth('/2fa/enable-setup', { method: 'POST' });
            if (result.basarili) {
                qrCodeImageEl.src = result.veri.qrCodeUrl;
                secretKeyDisplayEl.textContent = result.veri.secret;
                current2FASecret = result.veri.secret; // Secret'ı sonraki doğrulama için sakla
                displayUIMessage(enableMessageEl, 'QR kodu tarayın veya secret key\'i girin.', 'success'); // Bilgi mesajı
            } else {
                displayUIMessage(enableMessageEl, result.mesaj || 'QR Kod oluşturulamadı.', 'error');
            }
        } catch (err) {
            displayUIMessage(enableMessageEl, 'QR Kod oluşturulurken hata.', 'error');
        }
    }

    btnVerifyAndEnable.addEventListener('click', async () => {
        const token = verificationCodeInput.value;
        if (!token || !current2FASecret) {
            displayUIMessage(enableMessageEl, 'Lütfen 6 haneli kodu ve secret keyi sağlayın.', 'error');
            return;
        }
        try {
            const result = await fetchWithAuth('/2fa/enable-verify', {
                method: 'POST',
                body: { token, secret: current2FASecret }
            });
            displayUIMessage(enableMessageEl, result.mesaj, result.basarili ? 'success' : 'error');
            if (result.basarili) {
                verificationCodeInput.value = '';
                enable2FASection.classList.add('hidden');
                check2FAStatus(); // Durumu güncelle
            }
        } catch (err) {
            displayUIMessage(enableMessageEl, 'Doğrulama sırasında hata.', 'error');
        }
    });

    btnConfirmDisable.addEventListener('click', async () => {
        const password = disablePasswordInput.value;
        const twoFactorCode = disable2FACodeInput.value;
        if (!password) {
            displayUIMessage(disableMessageEl, 'Lütfen şifrenizi girin.', 'error');
            return;
        }
        // 2FA aktifse ve kod girilmemişse, iste. Backend zaten bunu kontrol ediyor ama UX için burada da edebiliriz.
        // if (is2FAEnabled && !twoFactorCode) {
        //     displayUIMessage(disableMessageEl, 'Lütfen 2FA kodunuzu girin.', 'error');
        //     return;
        // }

        try {
            const result = await fetchWithAuth('/2fa/disable', {
                method: 'POST',
                body: { password, twoFactorCode: twoFactorCode || undefined }
            });
            displayUIMessage(disableMessageEl, result.mesaj, result.basarili ? 'success' : 'error');
            if (result.basarili) {
                disablePasswordInput.value = '';
                disable2FACodeInput.value = '';
                disable2FASection.classList.add('hidden');
                check2FAStatus(); // Durumu güncelle
            }
        } catch (err) {
            displayUIMessage(disableMessageEl, 'Devre dışı bırakma sırasında hata.', 'error');
        }
    });
    
    btnGenerateBackupCodes.addEventListener('click', async () => {
        try {
            const result = await fetchWithAuth('/2fa/generate-backup-codes', { method: 'POST' });
            if (result.basarili && result.veri && result.veri.backupCodes) {
                backupCodeListEl.innerHTML = ''; // Önceki kodları temizle
                result.veri.backupCodes.forEach(code => {
                    const li = document.createElement('li');
                    li.textContent = code;
                    backupCodeListEl.appendChild(li);
                });
                displayUIMessage(backupMessageEl, result.mesaj + " Bu kodları sadece bir kez görebilirsiniz!", 'success');
            } else {
                displayUIMessage(backupMessageEl, result.mesaj || 'Yedek kod oluşturulamadı.', 'error');
            }
        } catch (err) {
            displayUIMessage(backupMessageEl, 'Yedek kod oluşturulurken hata.', 'error');
        }
    });


    // Sayfa yüklendiğinde 2FA durumunu kontrol et
    check2FAStatus();
