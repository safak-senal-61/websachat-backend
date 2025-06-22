
        // Configuration
        const CONFIG = {
            API_BASE_URL: "https://3000-firebase-websachat-backend-1748272624869.cluster-6vyo4gb53jczovun3dxslzjahs.cloudworkstations.dev",
            LOGIN_PAGE_URL: "/login.html",
            RETRY_ATTEMPTS: 3,
            RETRY_DELAY: 1000,
            AUTO_REDIRECT_DELAY: 3000
        };

        // DOM Elements
        const elements = {
            form: document.getElementById('resetPasswordForm'),
            passwordInput: document.getElementById('password'),
            confirmPasswordInput: document.getElementById('confirmPassword'),
            messageArea: document.getElementById('messageArea'),
            initialMessageArea: document.getElementById('initialMessageArea'),
            loader: document.getElementById('loader'),
            submitButton: document.getElementById('submitButton'),
            loginLink: document.getElementById('loginLink'),
            strengthBar: document.getElementById('strength-bar'),
            strengthText: document.getElementById('strength-text'),
            passwordValidation: document.getElementById('password-validation'),
            lengthCheck: document.getElementById('length-check'),
            matchCheck: document.getElementById('match-check'),
            uppercaseCheck: document.getElementById('uppercase-check'),
            numberCheck: document.getElementById('number-check')
        };

        // Validation state
        let validationState = {
            length: false,
            match: false,
            uppercase: false,
            number: false
        };

        // Utility functions
        function getUrlParameter(name) {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                return urlParams.get(name);
            } catch (error) {
                console.error('Error parsing URL parameters:', error);
                return null;
            }
        }

        function displayMessage(text, type) {
            elements.messageArea.textContent = text;
            elements.messageArea.className = `message ${type}`;
            elements.messageArea.style.display = 'block';
            
            if (type === 'success') {
                elements.messageArea.classList.add('success-animation');
            }
        }

        function hideMessage() {
            elements.messageArea.style.display = 'none';
            elements.messageArea.className = 'message';
        }

        function setLoadingState(loading) {
            elements.loader.style.display = loading ? 'block' : 'none';
            elements.submitButton.disabled = loading;
        }

        function hideFormAndShowLogin(successMessage) {
            elements.form.style.display = 'none';
            elements.initialMessageArea.style.display = 'none';
            
            if (successMessage) {
                displayMessage(successMessage, 'success');
            }
            
            elements.loginLink.href = CONFIG.LOGIN_PAGE_URL;
            elements.loginLink.style.display = 'block';
        }

        // Password strength calculation
        function calculatePasswordStrength(password) {
            let score = 0;
            
            if (password.length >= 8) score++;
            if (password.length >= 12) score++;
            if (/[a-z]/.test(password)) score++;
            if (/[A-Z]/.test(password)) score++;
            if (/[0-9]/.test(password)) score++;
            if (/[^A-Za-z0-9]/.test(password)) score++;
            
            return Math.min(score, 4);
        }

        function updatePasswordStrength(password) {
            const strength = calculatePasswordStrength(password);
            const percentage = (strength / 4) * 100;
            
            elements.strengthBar.style.width = `${percentage}%`;
            
            if (strength <= 1) {
                elements.strengthBar.className = 'strength-bar strength-weak';
                elements.strengthText.textContent = 'Zayıf';
            } else if (strength <= 2) {
                elements.strengthBar.className = 'strength-bar strength-medium';
                elements.strengthText.textContent = 'Orta';
            } else {
                elements.strengthBar.className = 'strength-bar strength-strong';
                elements.strengthText.textContent = 'Güçlü';
            }
        }

        function updateValidationUI(field, isValid) {
            const checkElement = elements[`${field}Check`];
            if (checkElement) {
                checkElement.className = `validation-check ${isValid ? 'valid' : 'invalid'}`;
                checkElement.textContent = isValid ? '✓' : '✗';
            }
            validationState[field] = isValid;
        }

        function validatePasswords() {
            const password = elements.passwordInput.value;
            const confirmPassword = elements.confirmPasswordInput.value;

            // Show validation panel when user starts typing
            if (password.length > 0) {
                elements.passwordValidation.style.display = 'block';
            }

            // Update validation checks
            updateValidationUI('length', password.length >= 8);
            updateValidationUI('uppercase', /[A-Z]/.test(password));
            updateValidationUI('number', /[0-9]/.test(password));
            updateValidationUI('match', password.length > 0 && password === confirmPassword);

            // Update password strength
            updatePasswordStrength(password);

            // Check if all validations pass
            const allValid = Object.values(validationState).every(Boolean);
            
            // Enable/disable submit button based on validation
            if (allValid && !elements.submitButton.classList.contains('loading')) {
                elements.submitButton.disabled = false;
            } else {
                elements.submitButton.disabled = true;
            }

            return allValid;
        }

        // API request with retry logic
        async function makeApiRequest(url, options = {}, retries = CONFIG.RETRY_ATTEMPTS) {
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await fetch(url, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        ...options
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    return await response.json();
                } catch (error) {
                    console.warn(`API request attempt ${i + 1} failed:`, error);
                    
                    if (i === retries - 1) {
                        throw error;
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * (i + 1)));
                }
            }
        }

        // Token validation
        async function validateTokenOnLoad() {
            const token = getUrlParameter('token');

            if (!token) {
                elements.initialMessageArea.innerHTML = '<p style="color: #ff3b30;">Şifre sıfırlama token\'ı bulunamadı. Lütfen e-postanızdaki linki tekrar kontrol edin.</p>';
                elements.form.style.display = 'none';
                elements.loginLink.href = CONFIG.LOGIN_PAGE_URL;
                elements.loginLink.style.display = 'block';
                return false;
            }

            // Basic token validation
            if (token.length < 10) {
                elements.initialMessageArea.innerHTML = '<p style="color: #ff3b30;">Geçersiz şifre sıfırlama token\'ı.</p>';
                elements.form.style.display = 'none';
                elements.loginLink.href = CONFIG.LOGIN_PAGE_URL;
                elements.loginLink.style.display = 'block';
                return false;
            }

            try {
                const apiUrl = `${CONFIG.API_BASE_URL}/auth/validate-reset-token?token=${encodeURIComponent(token)}`;
                const result = await makeApiRequest(apiUrl);

                if (!result.basarili) {
                    const errorMessage = result.mesaj || 'Şifre sıfırlama linki geçersiz veya süresi dolmuş.';
                    elements.initialMessageArea.innerHTML = `<p style="color: #ff3b30;">${errorMessage}</p>`;
                    elements.form.style.display = 'none';
                    elements.loginLink.href = CONFIG.LOGIN_PAGE_URL;
                    elements.loginLink.style.display = 'block';
                    return false;
                }

                return true;
            } catch (error) {
                console.error('Token validation error:', error);
                let errorMessage = 'Token doğrulanırken bir hata oluştu. ';
                
                if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                    errorMessage += 'İnternet bağlantınızı kontrol edip tekrar deneyin.';
                } else {
                    errorMessage += 'Lütfen daha sonra tekrar deneyin.';
                }
                
                elements.initialMessageArea.innerHTML = `<p style="color: #ff3b30;">${errorMessage}</p>`;
                elements.form.style.display = 'none';
                elements.loginLink.href = CONFIG.LOGIN_PAGE_URL;
                elements.loginLink.style.display = 'block';
                return false;
            }
        }

        // Form submission
        async function handleFormSubmit(event) {
            event.preventDefault();
            hideMessage();
            setLoadingState(true);

            const currentToken = getUrlParameter('token');
            if (!currentToken) {
                displayMessage('Şifre sıfırlama token\'ı eksik. Lütfen sayfayı yenileyin.', 'error');
                setLoadingState(false);
                hideFormAndShowLogin();
                return;
            }

            const password = elements.passwordInput.value;
            const confirmPassword = elements.confirmPasswordInput.value;

            // Final validation
            if (!validatePasswords()) {
                displayMessage('Lütfen tüm şifre gereksinimlerini karşıladığınızdan emin olun.', 'error');
                setLoadingState(false);
                return;
            }

            try {
                const apiUrl = `${CONFIG.API_BASE_URL}/auth/reset-password?token=${encodeURIComponent(currentToken)}`;
                const result = await makeApiRequest(apiUrl, {
                    method: 'POST',
                    body: JSON.stringify({ password, confirmPassword })
                });

                setLoadingState(false);

                if (result.basarili) {
                    const successMessage = result.mesaj || 'Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz.';
                    hideFormAndShowLogin(successMessage);
                    
                    // Auto redirect after success
                    setTimeout(() => {
                        if (elements.loginLink.href) {
                            window.location.href = elements.loginLink.href;
                        }
                    }, CONFIG.AUTO_REDIRECT_DELAY);
                } else {
                    const errorMessage = result.mesaj || 'Şifre güncellenirken bir hata oluştu. Lütfen tekrar deneyin.';
                    displayMessage(errorMessage, 'error');
                }
            } catch (error) {
                console.error('Password reset error:', error);
                setLoadingState(false);
                
                let errorMessage = 'Şifre sıfırlanırken bir hata oluştu. ';
                
                if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                    errorMessage += 'İnternet bağlantınızı kontrol edip tekrar deneyin.';
                } else if (error.message.includes('HTTP 5')) {
                    errorMessage += 'Sunucu geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
                } else {
                    errorMessage += 'Lütfen daha sonra tekrar deneyin.';
                }
                
                displayMessage(errorMessage, 'error');
            }
        }

        // Event listeners
        elements.form.addEventListener('submit', handleFormSubmit);

        elements.passwordInput.addEventListener('input', validatePasswords);
        elements.confirmPasswordInput.addEventListener('input', validatePasswords);

        // Real-time validation feedback
        elements.passwordInput.addEventListener('blur', function() {
            if (this.value.length > 0 && this.value.length < 8) {
                this.style.borderColor = '#ff3b30';
            }
        });

        elements.confirmPasswordInput.addEventListener('blur', function() {
            if (this.value.length > 0 && this.value !== elements.passwordInput.value) {
                this.style.borderColor = '#ff3b30';
            }
        });

        // Initialize application
        async function initializeApp() {
            await validateTokenOnLoad();
        }

        // Start the application
        document.addEventListener('DOMContentLoaded', initializeApp);
        
        // Fallback for older browsers
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeApp);
        } else {
            initializeApp();
        }
