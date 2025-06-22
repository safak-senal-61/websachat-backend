# Bildirimler Sayfası Endpointleri

Bu belge, WebSaChat uygulamasının bildirimler sayfasında kullanılabilecek tüm API endpointlerini listeler.

## Bildirimleri Listeleme ve Yönetme

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/notifications/me` | GET | Kullanıcının bildirimlerini listeler |
| `/notifications/{notificationId}/read` | POST | Belirli bir bildirimi okundu olarak işaretler |
| `/notifications/mark-all-read` | POST | Tüm bildirimleri okundu olarak işaretler |
| `/notifications/{notificationId}` | DELETE | Belirli bir bildirimi siler |
| `/notifications/clear` | DELETE | Tüm bildirimleri siler |
| `/notifications/unread-count` | GET | Okunmamış bildirim sayısını getirir |

## Bildirim Türleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/notifications/me?type=follow` | GET | Takip bildirimlerini listeler |
| `/notifications/me?type=like` | GET | Beğeni bildirimlerini listeler |
| `/notifications/me?type=comment` | GET | Yorum bildirimlerini listeler |
| `/notifications/me?type=mention` | GET | Bahsetme bildirimlerini listeler |
| `/notifications/me?type=gift` | GET | Hediye bildirimlerini listeler |
| `/notifications/me?type=stream` | GET | Yayın bildirimlerini listeler |
| `/notifications/me?type=friend_request` | GET | Arkadaşlık isteği bildirimlerini listeler |
| `/notifications/me?type=game_invite` | GET | Oyun daveti bildirimlerini listeler |
| `/notifications/me?type=tournament` | GET | Turnuva bildirimlerini listeler |
| `/notifications/me?type=achievement` | GET | Başarı bildirimlerini listeler |
| `/notifications/me?type=system` | GET | Sistem bildirimlerini listeler |

## Bildirim Ayarları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/preferences/notifications` | GET | Bildirim tercihlerini getirir |
| `/preferences/notifications` | PUT | Bildirim tercihlerini günceller |
| `/preferences/notifications/follow` | PUT | Takip bildirim tercihlerini günceller |
| `/preferences/notifications/like` | PUT | Beğeni bildirim tercihlerini günceller |
| `/preferences/notifications/comment` | PUT | Yorum bildirim tercihlerini günceller |
| `/preferences/notifications/mention` | PUT | Bahsetme bildirim tercihlerini günceller |
| `/preferences/notifications/gift` | PUT | Hediye bildirim tercihlerini günceller |
| `/preferences/notifications/stream` | PUT | Yayın bildirim tercihlerini günceller |
| `/preferences/notifications/friend_request` | PUT | Arkadaşlık isteği bildirim tercihlerini günceller |
| `/preferences/notifications/game_invite` | PUT | Oyun daveti bildirim tercihlerini günceller |
| `/preferences/notifications/tournament` | PUT | Turnuva bildirim tercihlerini günceller |
| `/preferences/notifications/achievement` | PUT | Başarı bildirim tercihlerini günceller |
| `/preferences/notifications/system` | PUT | Sistem bildirim tercihlerini günceller |

## Bildirim Abonelikleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/notifications/subscriptions` | GET | Bildirim aboneliklerini listeler |
| `/notifications/subscriptions/{userId}` | POST | Bir kullanıcının bildirimlerine abone olur |
| `/notifications/subscriptions/{userId}` | DELETE | Bir kullanıcının bildirim aboneliğini iptal eder |
| `/notifications/subscriptions/streams/{streamerId}` | POST | Bir yayıncının yayın bildirimlerine abone olur |
| `/notifications/subscriptions/streams/{streamerId}` | DELETE | Bir yayıncının yayın bildirim aboneliğini iptal eder |
| `/notifications/subscriptions/tournaments/{tournamentId}` | POST | Bir turnuvanın bildirimlerine abone olur |
| `/notifications/subscriptions/tournaments/{tournamentId}` | DELETE | Bir turnuvanın bildirim aboneliğini iptal eder |

## Bildirim Kanalları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/preferences/notifications/channels` | GET | Bildirim kanalı tercihlerini getirir |
| `/preferences/notifications/channels` | PUT | Bildirim kanalı tercihlerini günceller |
| `/preferences/notifications/channels/push` | PUT | Push bildirim tercihlerini günceller |
| `/preferences/notifications/channels/email` | PUT | E-posta bildirim tercihlerini günceller |
| `/preferences/notifications/channels/in_app` | PUT | Uygulama içi bildirim tercihlerini günceller |

## Bildirim Cihazları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/notifications/devices` | GET | Bildirim cihazlarını listeler |
| `/notifications/devices` | POST | Yeni bir bildirim cihazı ekler |
| `/notifications/devices/{deviceId}` | DELETE | Bir bildirim cihazını siler |
| `/notifications/devices/{deviceId}` | PUT | Bir bildirim cihazını günceller |