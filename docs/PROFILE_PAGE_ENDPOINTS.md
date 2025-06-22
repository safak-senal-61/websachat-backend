# Profil Sayfası Endpointleri

Bu belge, WebSaChat uygulamasının profil sayfasında kullanılabilecek tüm API endpointlerini listeler.

## Profil Görüntüleme

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/follows/profile/{username}` | GET | Kullanıcı profilini getirir |
| `/users/{userId}/achievements` | GET | Kullanıcının başarılarını listeler |
| `/users/{userId}/games` | GET | Kullanıcının oynadığı oyunları listeler |
| `/users/{userId}/streams` | GET | Kullanıcının yayınlarını listeler |

## Profil Etkileşimleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/follows/{userId}/follow` | POST | Bir kullanıcıyı takip eder |
| `/follows/{userId}/unfollow` | POST | Bir kullanıcıyı takipten çıkarır |
| `/follows/{userId}/block` | POST | Bir kullanıcıyı engeller |
| `/follows/{userId}/unblock` | POST | Bir kullanıcının engelini kaldırır |

## Takipçi ve Takip Edilen Listeleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/follows/followers` | GET | Kullanıcının takipçilerini listeler |
| `/follows/following` | GET | Kullanıcının takip ettiklerini listeler |

## Kullanıcı İstatistikleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/users/{userId}/stats` | GET | Kullanıcının istatistiklerini getirir (takipçi sayısı, takip edilen sayısı, vb.) |
| `/users/{userId}/activity` | GET | Kullanıcının son aktivitelerini listeler |

## Kullanıcı Gönderileri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/users/{userId}/posts` | GET | Kullanıcının gönderilerini listeler |
| `/users/{userId}/likes` | GET | Kullanıcının beğendiği içerikleri listeler |

## Kullanıcı Oyun Aktiviteleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/users/{userId}/game-sessions` | GET | Kullanıcının oyun oturumlarını listeler |
| `/users/{userId}/game-stats` | GET | Kullanıcının oyun istatistiklerini getirir |
| `/matchmaking/skill/{gameId}` | GET | Belirli bir oyun için kullanıcının beceri seviyesini getirir |

## Kullanıcı Yayın Aktiviteleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/users/{userId}/streams` | GET | Kullanıcının yayınlarını listeler |
| `/users/{userId}/stream-stats` | GET | Kullanıcının yayın istatistiklerini getirir |

## Hediye Gönderme

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/gifts/{giftModelId}/send` | POST | Belirli bir hediyeyi profil sahibine gönderir |
| `/gifts/received` | GET | Alınan hediyeleri listeler |
| `/gifts/sent` | GET | Gönderilen hediyeleri listeler |

## Raporlama

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/reports/user` | POST | Profil sahibini raporlar |