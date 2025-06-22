# Ayarlar Sayfası Endpointleri

Bu belge, WebSaChat uygulamasının ayarlar sayfasında kullanılabilecek tüm API endpointlerini listeler.

## Profil Ayarları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/settings/profile` | PUT | Giriş yapmış kullanıcının profil bilgilerini günceller |
| `/settings/username` | PUT | Kullanıcı adını değiştirir |
| `/settings/profile-picture` | POST | Profil resmini günceller |

## Güvenlik Ayarları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/settings/password` | PUT | Giriş yapmış kullanıcının şifresini günceller |
| `/settings/email/request-change` | POST | E-posta değişikliği talebi başlatır ve doğrulama linki gönderir |
| `/settings/email/verify-change` | GET | E-posta değişikliğini doğrular |

## İki Faktörlü Kimlik Doğrulama

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/2fa/enable-setup` | POST | Kullanıcı için 2FA kurulumunu başlatır ve QR kodu/secret döndürür |
| `/2fa/enable-verify` | POST | Kullanıcının girdiği 2FA kodunu doğrular ve 2FA'yı aktifleştirir |
| `/2fa/disable` | POST | Kullanıcı için 2FA'yı devre dışı bırakır |
| `/2fa/backup-codes/generate` | POST | Yeni yedek kodlar oluşturur |
| `/2fa/backup-codes` | GET | Mevcut yedek kodları listeler |

## Hesap Yönetimi

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/settings/account/deactivate` | POST | Hesabı geçici olarak devre dışı bırakır |
| `/settings/account/delete` | POST | Hesabı kalıcı olarak siler |

## Cihaz ve Oturum Yönetimi

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/auth/devices` | GET | Kullanıcının güvenilir cihazlarını listeler |
| `/auth/devices/{deviceId}` | DELETE | Belirli bir cihazı güvenilir cihazlardan kaldırır |
| `/auth/devices/revoke-all` | POST | Tüm cihazlardaki oturumları sonlandırır |

## API Anahtarları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/auth/apikeys` | POST | Yeni bir API anahtarı oluşturur |
| `/auth/apikeys` | GET | Kullanıcının API anahtarlarını listeler |
| `/auth/apikeys/{keyId}` | DELETE | Belirli bir API anahtarını siler |

## Gizlilik Tercihleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/preferences/account/visibility` | PUT | Hesap gizlilik durumunu ayarlar (Herkese Açık/Gizli) |
| `/preferences/account/visibility` | GET | Mevcut hesap gizlilik durumunu getirir |
| `/preferences/activity-status/visibility` | PUT | Çevrimiçi/aktivite durumu görünürlüğünü ayarlar |
| `/preferences/activity-status/visibility` | GET | Mevcut çevrimiçi/aktivite durumu görünürlük ayarını getirir |

## Mesajlaşma Tercihleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/preferences/messaging/direct-message-policy` | PUT | Kimlerin direkt mesaj gönderebileceğini ayarlar |
| `/preferences/messaging/direct-message-policy` | GET | Mevcut direkt mesaj politikasını getirir |

## Bildirim Tercihleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/preferences/notifications/settings` | PUT | Bildirim tercihlerini günceller |
| `/preferences/notifications/settings` | GET | Mevcut bildirim tercihlerini getirir |

## Yerelleştirme Tercihleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/preferences/localization/language` | PUT | Tercih edilen dili ayarlar |
| `/preferences/localization/language` | GET | Mevcut dil tercihini getirir |
| `/preferences/localization/timezone` | PUT | Tercih edilen saat dilimini ayarlar |
| `/preferences/localization/timezone` | GET | Mevcut saat dilimi tercihini getirir |

## Engellenen Kullanıcılar

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/follows/blocked` | GET | Engellenen kullanıcıları listeler |
| `/follows/{userId}/unblock` | POST | Bir kullanıcının engelini kaldırır |