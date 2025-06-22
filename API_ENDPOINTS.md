# WebSaChat API Endpoints Dokümantasyonu

Bu belge, WebSaChat backend API'sinin tüm endpointlerini kategorize edilmiş şekilde listeler. Her bölüm, uygulamanın farklı bir sayfası veya işlevi için kullanılan endpointleri içerir.

## İçindekiler

- [Kullanıcı Kimlik Doğrulama ve Hesap Yönetimi](#kullanıcı-kimlik-doğrulama-ve-hesap-yönetimi)
- [Profil Sayfası](#profil-sayfası)
- [Kullanıcı Ayarları](#kullanıcı-ayarları)
- [Kullanıcı Tercihleri](#kullanıcı-tercihleri)
- [Sohbet ve Mesajlaşma](#sohbet-ve-mesajlaşma)
- [Takip Etme ve Sosyal Etkileşim](#takip-etme-ve-sosyal-etkileşim)
- [Oyun Etkileşimleri](#oyun-etkileşimleri)
- [Oyun Oturumları](#oyun-oturumları)
- [Canlı Yayın](#canlı-yayın)
- [Bildirimler](#bildirimler)
- [İşlemler ve Ödemeler](#i̇şlemler-ve-ödemeler)
- [Hediyeler](#hediyeler)
- [İki Faktörlü Kimlik Doğrulama](#i̇ki-faktörlü-kimlik-doğrulama)
- [Turnuvalar](#turnuvalar)
- [Eşleştirme Sistemi](#eşleştirme-sistemi)
- [Raporlama](#raporlama)

## Kullanıcı Kimlik Doğrulama ve Hesap Yönetimi

### Standart Kimlik Doğrulama

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/auth/login` | POST | Kullanıcı girişi yapar ve token oluşturur |
| `/auth/refresh-token` | POST | Yenileme token'ını kullanarak erişim token'ını yeniler |
| `/auth/logout` | POST | Kullanıcının oturumunu sonlandırır |
| `/auth/me` | GET | Giriş yapmış kullanıcının kendi profil bilgilerini getirir |

### Kayıt ve E-posta Doğrulama

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/auth/register` | POST | Yeni kullanıcı kaydı oluşturur |
| `/auth/verify-email` | GET | E-posta adresini doğrular |
| `/auth/resend-verification` | POST | Doğrulama e-postasını yeniden gönderir |

### OAuth ve Sosyal Giriş

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/auth/oauth/google` | GET | Google ile giriş başlatır |
| `/auth/oauth/facebook` | GET | Facebook ile giriş başlatır |
| `/auth/oauth/discord` | GET | Discord ile giriş başlatır |
| `/auth/oauth/callback` | GET | OAuth sağlayıcılarından gelen callback'i işler |

### Oturum Yönetimi

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/auth/devices` | GET | Kullanıcının güvenilir cihazlarını listeler |
| `/auth/devices/{deviceId}` | DELETE | Belirli bir cihazı güvenilir cihazlardan kaldırır |
| `/auth/devices/revoke-all` | POST | Tüm cihazlardaki oturumları sonlandırır |

### API Anahtarları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/auth/apikeys` | POST | Yeni bir API anahtarı oluşturur |
| `/auth/apikeys` | GET | Kullanıcının API anahtarlarını listeler |
| `/auth/apikeys/{keyId}` | DELETE | Belirli bir API anahtarını siler |

## Profil Sayfası

### Profil Görüntüleme

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/follows/profile/{username}` | GET | Kullanıcı profilini getirir |
| `/users/{userId}/achievements` | GET | Kullanıcının başarılarını listeler |
| `/users/{userId}/games` | GET | Kullanıcının oynadığı oyunları listeler |
| `/users/{userId}/streams` | GET | Kullanıcının yayınlarını listeler |

### Profil Etkileşimleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/follows/{userId}/follow` | POST | Bir kullanıcıyı takip eder |
| `/follows/{userId}/unfollow` | POST | Bir kullanıcıyı takipten çıkarır |
| `/follows/{userId}/block` | POST | Bir kullanıcıyı engeller |
| `/follows/{userId}/unblock` | POST | Bir kullanıcının engelini kaldırır |

## Kullanıcı Ayarları

### Profil Ayarları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/settings/profile` | PUT | Giriş yapmış kullanıcının profil bilgilerini günceller |
| `/settings/username` | PUT | Kullanıcı adını değiştirir |
| `/settings/profile-picture` | POST | Profil resmini günceller |

### Güvenlik Ayarları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/settings/password` | PUT | Giriş yapmış kullanıcının şifresini günceller |
| `/settings/email/request-change` | POST | E-posta değişikliği talebi başlatır ve doğrulama linki gönderir |
| `/settings/email/verify-change` | GET | E-posta değişikliğini doğrular |

### Hesap Yönetimi

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/settings/account/deactivate` | POST | Hesabı geçici olarak devre dışı bırakır |
| `/settings/account/delete` | POST | Hesabı kalıcı olarak siler |

## Kullanıcı Tercihleri

### Gizlilik Tercihleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/preferences/account/visibility` | PUT | Hesap gizlilik durumunu ayarlar (Herkese Açık/Gizli) |
| `/preferences/account/visibility` | GET | Mevcut hesap gizlilik durumunu getirir |
| `/preferences/activity-status/visibility` | PUT | Çevrimiçi/aktivite durumu görünürlüğünü ayarlar |
| `/preferences/activity-status/visibility` | GET | Mevcut çevrimiçi/aktivite durumu görünürlük ayarını getirir |

### Mesajlaşma Tercihleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/preferences/messaging/direct-message-policy` | PUT | Kimlerin direkt mesaj gönderebileceğini ayarlar |
| `/preferences/messaging/direct-message-policy` | GET | Mevcut direkt mesaj politikasını getirir |

### Bildirim Tercihleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/preferences/notifications/settings` | PUT | Bildirim tercihlerini günceller |
| `/preferences/notifications/settings` | GET | Mevcut bildirim tercihlerini getirir |

### Yerelleştirme Tercihleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/preferences/localization/language` | PUT | Tercih edilen dili ayarlar |
| `/preferences/localization/language` | GET | Mevcut dil tercihini getirir |
| `/preferences/localization/timezone` | PUT | Tercih edilen saat dilimini ayarlar |
| `/preferences/localization/timezone` | GET | Mevcut saat dilimi tercihini getirir |

## Sohbet ve Mesajlaşma

### Sohbet Odaları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/chatrooms` | POST | Yeni bir sohbet odası oluşturur |
| `/chatrooms/public` | GET | Herkese açık ve aktif sohbet odalarını listeler |
| `/chatrooms/search` | GET | Başlık veya açıklamaya göre sohbet odalarını arar |
| `/chatrooms/{roomId}` | GET | Belirli bir sohbet odasının detaylarını getirir |
| `/chatrooms/{roomId}` | PUT | Sohbet odası bilgilerini günceller |
| `/chatrooms/{roomId}` | DELETE | Sohbet odasını siler |

### Mesajlar

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/chatrooms/{roomId}/messages` | POST | Bir sohbet odasına mesaj gönderir |
| `/chatrooms/{roomId}/messages` | GET | Bir sohbet odasındaki mesajları listeler |
| `/messages/{messageId}` | PUT | Bir mesajı düzenler |
| `/messages/{messageId}` | DELETE | Bir mesajı siler |
| `/messages/{messageId}/read` | POST | Bir mesajı okundu olarak işaretler |

### Katılımcılar

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/chatrooms/{roomId}/participants` | POST | Bir kullanıcıyı sohbet odasına ekler |
| `/chatrooms/{roomId}/participants` | GET | Sohbet odasındaki katılımcıları listeler |
| `/chatrooms/{roomId}/participants/{userId}` | DELETE | Bir kullanıcıyı sohbet odasından çıkarır |
| `/chatrooms/{roomId}/leave` | POST | Kullanıcının sohbet odasından ayrılmasını sağlar |

## Takip Etme ve Sosyal Etkileşim

### Takip İşlemleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/follows/{userId}/follow` | POST | Bir kullanıcıyı takip eder |
| `/follows/{userId}/unfollow` | POST | Bir kullanıcıyı takipten çıkarır |
| `/follows/followers` | GET | Kullanıcının takipçilerini listeler |
| `/follows/following` | GET | Kullanıcının takip ettiklerini listeler |

### Takip İstekleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/follows/requests/pending` | GET | Bekleyen takip isteklerini listeler |
| `/follows/requests/{requestId}/accept` | POST | Bir takip isteğini kabul eder |
| `/follows/requests/{requestId}/reject` | POST | Bir takip isteğini reddeder |

### Engelleme

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/follows/{userId}/block` | POST | Bir kullanıcıyı engeller |
| `/follows/{userId}/unblock` | POST | Bir kullanıcının engelini kaldırır |
| `/follows/blocked` | GET | Engellenen kullanıcıları listeler |

### Keşif

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/follows/discover/suggested` | GET | Takip edilmesi önerilen kullanıcıları listeler |
| `/follows/discover/popular` | GET | Popüler kullanıcıları listeler |

## Oyun Etkileşimleri

### Oyun Listeleme ve Arama

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/games` | GET | Oyunları listeler |
| `/games/search` | GET | Oyunları arar |
| `/games/categories` | GET | Oyun kategorilerini listeler |
| `/games/{gameModelId}` | GET | Belirli bir oyunun detaylarını getirir |

### Oyun Etkileşimleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/games/{gameModelId}/like` | POST | Bir oyunu beğenir veya beğeniyi geri alır |
| `/games/{gameModelId}/rate` | POST | Bir oyuna puan verir veya mevcut puanı günceller |
| `/games/{gameModelId}/ratings` | GET | Bir oyun için verilen tüm puanları ve yorumları listeler |

## Oyun Oturumları

### Oturum Yönetimi

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/game-sessions` | POST | Yeni bir oyun oturumu oluşturur |
| `/game-sessions` | GET | Oyun oturumlarını listeler |
| `/game-sessions/{sessionId}` | GET | Belirli bir oyun oturumunun detaylarını getirir |
| `/game-sessions/{sessionId}` | PUT | Oyun oturumu bilgilerini günceller |
| `/game-sessions/{sessionId}` | DELETE | Oyun oturumunu siler |

### Katılımcı Yönetimi

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/game-sessions/{sessionId}/join` | POST | Bir oyun oturumuna katılır |
| `/game-sessions/{sessionId}/leave` | POST | Bir oyun oturumundan ayrılır |
| `/game-sessions/{sessionId}/participants` | GET | Oyun oturumundaki katılımcıları listeler |
| `/game-sessions/{sessionId}/kick/{userId}` | POST | Bir kullanıcıyı oyun oturumundan atar |

## Canlı Yayın

### Yayın Yönetimi

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/streams` | POST | Yeni bir canlı yayın başlatır veya planlar |
| `/streams` | GET | Aktif canlı yayınları listeler |
| `/streams/{streamId}` | GET | Belirli bir yayının detaylarını getirir |
| `/streams/{streamId}` | PUT | Yayın bilgilerini günceller |
| `/streams/{streamId}` | DELETE | Yayını sonlandırır veya iptal eder |

### Yayın Etkileşimleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/streams/{streamId}/token` | GET | Bir izleyici için Agora RTC token'ı üretir |
| `/streams/{streamId}/viewers` | GET | Yayındaki izleyicileri listeler |
| `/streams/{streamId}/chat` | GET | Yayın sohbetini getirir |
| `/streams/{streamId}/chat` | POST | Yayın sohbetine mesaj gönderir |

## Bildirimler

### Bildirim Yönetimi

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/notifications/me` | GET | Giriş yapmış kullanıcının bildirimlerini listeler |
| `/notifications/{notificationId}/read` | POST | Belirli bir bildirimi okundu olarak işaretler |
| `/notifications/mark-all-read` | POST | Tüm okunmamış bildirimleri okundu olarak işaretler |

## İşlemler ve Ödemeler

### Kullanıcı İşlemleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/transactions/me` | GET | Giriş yapmış kullanıcının kendi işlemlerini listeler |
| `/transactions/balance/me` | GET | Giriş yapmış kullanıcının jeton ve elmas bakiyesini getirir |
| `/transactions/convert/diamonds-to-coins` | POST | Kullanıcının elmaslarını jetona dönüştürür |

### Ödeme İşlemleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/transactions/purchase/coins` | POST | Jeton satın alma işlemi başlatır |
| `/transactions/purchase/diamonds` | POST | Elmas satın alma işlemi başlatır |
| `/transactions/purchase/callback` | POST | Ödeme sağlayıcısından gelen callback'i işler |

## Hediyeler

### Hediye Gönderme

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/gifts/{giftModelId}/send` | POST | Belirli bir hediyeyi bir kullanıcıya veya odaya gönderir |

### Hediye Yönetimi

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/gifts` | GET | Mevcut hediyeleri listeler |
| `/gifts/received` | GET | Alınan hediyeleri listeler |
| `/gifts/sent` | GET | Gönderilen hediyeleri listeler |

## İki Faktörlü Kimlik Doğrulama

### 2FA Kurulumu

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/2fa/enable-setup` | POST | Kullanıcı için 2FA kurulumunu başlatır ve QR kodu/secret döndürür |
| `/2fa/enable-verify` | POST | Kullanıcının girdiği 2FA kodunu doğrular ve 2FA'yı aktifleştirir |
| `/2fa/disable` | POST | Kullanıcı için 2FA'yı devre dışı bırakır |

### Yedek Kodlar

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/2fa/backup-codes/generate` | POST | Yeni yedek kodlar oluşturur |
| `/2fa/backup-codes` | GET | Mevcut yedek kodları listeler |

## Turnuvalar

### Turnuva Yönetimi

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/tournaments` | POST | Yeni bir turnuva oluşturur |
| `/tournaments` | GET | Turnuvaları listeler |
| `/tournaments/{tournamentId}` | GET | Belirli bir turnuvanın detaylarını getirir |
| `/tournaments/{tournamentId}` | PUT | Turnuva bilgilerini günceller |
| `/tournaments/{tournamentId}` | DELETE | Turnuvayı siler |

### Turnuva Katılımcıları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/tournaments/{tournamentId}/register` | POST | Bir turnuvaya kayıt olur |
| `/tournaments/{tournamentId}/unregister` | POST | Turnuva kaydını iptal eder |
| `/tournaments/{tournamentId}/participants` | GET | Turnuva katılımcılarını listeler |

### Turnuva Maçları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/tournaments/{tournamentId}/matches` | GET | Turnuva maçlarını listeler |
| `/tournaments/{tournamentId}/matches/{matchId}` | GET | Belirli bir turnuva maçının detaylarını getirir |
| `/tournaments/{tournamentId}/matches/{matchId}/result` | POST | Maç sonucunu bildirir |

## Eşleştirme Sistemi

### Eşleştirme Kuyruğu

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/games/{gameId}/matchmaking/join` | POST | Eşleştirme kuyruğuna katılır |
| `/games/{gameId}/matchmaking/leave` | POST | Eşleştirme kuyruğundan ayrılır |
| `/matchmaking/status` | GET | Kullanıcının eşleştirme durumunu kontrol eder |

### Beceri Seviyesi

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/matchmaking/skill/{gameId}` | GET | Belirli bir oyun için kullanıcının beceri seviyesini getirir |
| `/matchmaking/leaderboard/{gameId}` | GET | Oyun için beceri seviyesi sıralamasını getirir |

## Raporlama

### Kullanıcı Raporları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/reports/user` | POST | Bir kullanıcıyı raporlar |
| `/reports/message` | POST | Bir mesajı raporlar |
| `/reports/stream` | POST | Bir yayını raporlar |
| `/reports/game` | POST | Bir oyunu raporlar |

### Admin İşlemleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/reports/all` | GET | Tüm raporları listeler (Sadece Admin/Moderatör) |
| `/reports/{reportId}` | GET | Belirli bir raporun detaylarını getirir (Sadece Admin/Moderatör) |
| `/reports/{reportId}/resolve` | POST | Bir raporu çözüldü olarak işaretler (Sadece Admin/Moderatör) |
| `/reports/{reportId}/dismiss` | POST | Bir raporu reddeder (Sadece Admin/Moderatör) |