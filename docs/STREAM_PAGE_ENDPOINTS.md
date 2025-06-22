# Canlı Yayın Sayfası Endpointleri

Bu belge, WebSaChat uygulamasının canlı yayın sayfasında kullanılabilecek tüm API endpointlerini listeler.

## Yayın Listeleme ve Arama

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/streams` | GET | Aktif canlı yayınları listeler |
| `/streams/search` | GET | Canlı yayınları arar |
| `/streams/categories` | GET | Yayın kategorilerini listeler |
| `/streams/popular` | GET | Popüler yayınları listeler |
| `/streams/following` | GET | Takip edilen kullanıcıların yayınlarını listeler |
| `/streams/recommended` | GET | Kullanıcıya önerilen yayınları listeler |
| `/streams/scheduled` | GET | Planlanmış yayınları listeler |

## Yayın Yönetimi

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/streams` | POST | Yeni bir canlı yayın başlatır veya planlar |
| `/streams/{streamId}` | GET | Belirli bir yayının detaylarını getirir |
| `/streams/{streamId}` | PUT | Yayın bilgilerini günceller |
| `/streams/{streamId}` | DELETE | Yayını sonlandırır veya iptal eder |
| `/streams/{streamId}/start` | POST | Planlanmış bir yayını başlatır |
| `/streams/{streamId}/end` | POST | Aktif bir yayını sonlandırır |
| `/streams/{streamId}/pause` | POST | Yayını geçici olarak duraklatır |
| `/streams/{streamId}/resume` | POST | Duraklatılmış yayını devam ettirir |

## Yayın Etkileşimleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/streams/{streamId}/token` | GET | Bir izleyici için Agora RTC token'ı üretir |
| `/streams/{streamId}/viewers` | GET | Yayındaki izleyicileri listeler |
| `/streams/{streamId}/like` | POST | Yayını beğenir veya beğeniyi geri alır |
| `/streams/{streamId}/follow` | POST | Yayıncıyı takip eder |
| `/streams/{streamId}/stats` | GET | Yayın istatistiklerini getirir (izleyici sayısı, beğeni sayısı, vb.) |

## Yayın Sohbeti

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/streams/{streamId}/chat` | GET | Yayın sohbetini getirir |
| `/streams/{streamId}/chat` | POST | Yayın sohbetine mesaj gönderir |
| `/streams/{streamId}/chat/pin` | POST | Bir mesajı sabitler |
| `/streams/{streamId}/chat/unpin` | POST | Sabitlenmiş mesajı kaldırır |
| `/streams/{streamId}/chat/clear` | POST | Sohbeti temizler |

## Moderasyon

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/streams/{streamId}/moderators` | GET | Yayın moderatörlerini listeler |
| `/streams/{streamId}/moderators` | POST | Bir kullanıcıyı moderatör olarak ekler |
| `/streams/{streamId}/moderators/{userId}` | DELETE | Bir kullanıcıyı moderatörlükten çıkarır |
| `/streams/{streamId}/mute/{userId}` | POST | Bir kullanıcıyı yayın sohbetinde susturur |
| `/streams/{streamId}/unmute/{userId}` | POST | Bir kullanıcının susturulmasını kaldırır |
| `/streams/{streamId}/ban/{userId}` | POST | Bir kullanıcıyı yayından yasaklar |
| `/streams/{streamId}/unban/{userId}` | POST | Bir kullanıcının yasağını kaldırır |

## Hediye Gönderme

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/gifts/{giftModelId}/send` | POST | Belirli bir hediyeyi yayıncıya gönderir |
| `/streams/{streamId}/gifts` | GET | Yayında gönderilen hediyeleri listeler |
| `/gifts` | GET | Mevcut hediyeleri listeler |

## Bildirimler

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/streams/{streamId}/subscribe` | POST | Yayın bildirimlerine abone olur |
| `/streams/{streamId}/unsubscribe` | POST | Yayın bildirimlerinden çıkar |
| `/streams/subscriptions` | GET | Abone olunan yayınları listeler |

## Yayın Ayarları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/streams/{streamId}/settings` | GET | Yayın ayarlarını getirir |
| `/streams/{streamId}/settings` | PUT | Yayın ayarlarını günceller |
| `/streams/{streamId}/thumbnail` | POST | Yayın küçük resmini günceller |
| `/streams/{streamId}/title` | PUT | Yayın başlığını günceller |
| `/streams/{streamId}/category` | PUT | Yayın kategorisini günceller |

## Raporlama

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/reports/stream` | POST | Bir yayını raporlar |
| `/reports/streamer` | POST | Bir yayıncıyı raporlar |
| `/reports/chat-message` | POST | Bir sohbet mesajını raporlar |