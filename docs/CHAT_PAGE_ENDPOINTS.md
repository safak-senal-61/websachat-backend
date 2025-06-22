# Sohbet ve Mesajlaşma Sayfası Endpointleri

Bu belge, WebSaChat uygulamasının sohbet ve mesajlaşma sayfasında kullanılabilecek tüm API endpointlerini listeler.

## Sohbet Odaları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/chatrooms` | POST | Yeni bir sohbet odası oluşturur |
| `/chatrooms/public` | GET | Herkese açık ve aktif sohbet odalarını listeler |
| `/chatrooms/search` | GET | Başlık veya açıklamaya göre sohbet odalarını arar |
| `/chatrooms/{roomId}` | GET | Belirli bir sohbet odasının detaylarını getirir |
| `/chatrooms/{roomId}` | PUT | Sohbet odası bilgilerini günceller |
| `/chatrooms/{roomId}` | DELETE | Sohbet odasını siler |

## Mesajlar

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/chatrooms/{roomId}/messages` | POST | Bir sohbet odasına mesaj gönderir |
| `/chatrooms/{roomId}/messages` | GET | Bir sohbet odasındaki mesajları listeler |
| `/messages/{messageId}` | PUT | Bir mesajı düzenler |
| `/messages/{messageId}` | DELETE | Bir mesajı siler |
| `/messages/{messageId}/read` | POST | Bir mesajı okundu olarak işaretler |

## Katılımcılar

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/chatrooms/{roomId}/participants` | POST | Bir kullanıcıyı sohbet odasına ekler |
| `/chatrooms/{roomId}/participants` | GET | Sohbet odasındaki katılımcıları listeler |
| `/chatrooms/{roomId}/participants/{userId}` | DELETE | Bir kullanıcıyı sohbet odasından çıkarır |
| `/chatrooms/{roomId}/leave` | POST | Kullanıcının sohbet odasından ayrılmasını sağlar |

## Oda Özellikleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/chatrooms/{roomId}/settings` | GET | Sohbet odası ayarlarını getirir |
| `/chatrooms/{roomId}/settings` | PUT | Sohbet odası ayarlarını günceller |
| `/chatrooms/{roomId}/avatar` | POST | Sohbet odası avatarını günceller |

## Moderasyon

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/chatrooms/{roomId}/moderators` | GET | Sohbet odası moderatörlerini listeler |
| `/chatrooms/{roomId}/moderators` | POST | Bir kullanıcıyı moderatör olarak ekler |
| `/chatrooms/{roomId}/moderators/{userId}` | DELETE | Bir kullanıcıyı moderatörlükten çıkarır |
| `/chatrooms/{roomId}/mute/{userId}` | POST | Bir kullanıcıyı sohbet odasında susturur |
| `/chatrooms/{roomId}/unmute/{userId}` | POST | Bir kullanıcının susturulmasını kaldırır |

## Dosya ve Medya Paylaşımı

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/chatrooms/{roomId}/files` | POST | Bir sohbet odasına dosya yükler |
| `/chatrooms/{roomId}/files` | GET | Bir sohbet odasındaki dosyaları listeler |
| `/chatrooms/{roomId}/media` | GET | Bir sohbet odasındaki medya dosyalarını listeler |

## Okunmamış Mesajlar

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/chatrooms/unread` | GET | Tüm sohbet odalarındaki okunmamış mesaj sayılarını getirir |
| `/chatrooms/{roomId}/unread` | GET | Belirli bir sohbet odasındaki okunmamış mesaj sayısını getirir |
| `/chatrooms/{roomId}/mark-read` | POST | Bir sohbet odasındaki tüm mesajları okundu olarak işaretler |

## Arama

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/chatrooms/{roomId}/messages/search` | GET | Bir sohbet odasındaki mesajları arar |
| `/messages/search` | GET | Tüm mesajları arar |

## Hediye Gönderme

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/gifts/{giftModelId}/send` | POST | Belirli bir hediyeyi bir kullanıcıya veya odaya gönderir |
| `/chatrooms/{roomId}/gifts` | GET | Bir sohbet odasında gönderilen hediyeleri listeler |

## Raporlama

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/reports/message` | POST | Bir mesajı raporlar |
| `/reports/user` | POST | Bir kullanıcıyı raporlar |