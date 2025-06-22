# Oyun Sayfası Endpointleri

Bu belge, WebSaChat uygulamasının oyun sayfasında kullanılabilecek tüm API endpointlerini listeler.

## Oyun Listeleme ve Arama

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/games` | GET | Oyunları listeler |
| `/games/search` | GET | Oyunları arar |
| `/games/categories` | GET | Oyun kategorilerini listeler |
| `/games/{gameModelId}` | GET | Belirli bir oyunun detaylarını getirir |
| `/games/popular` | GET | Popüler oyunları listeler |
| `/games/new` | GET | Yeni eklenen oyunları listeler |
| `/games/recommended` | GET | Kullanıcıya önerilen oyunları listeler |

## Oyun Etkileşimleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/games/{gameModelId}/like` | POST | Bir oyunu beğenir veya beğeniyi geri alır |
| `/games/{gameModelId}/rate` | POST | Bir oyuna puan verir veya mevcut puanı günceller |
| `/games/{gameModelId}/ratings` | GET | Bir oyun için verilen tüm puanları ve yorumları listeler |
| `/games/{gameModelId}/play` | POST | Bir oyunu oynamaya başlar |

## Oyun Oturumları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/game-sessions` | POST | Yeni bir oyun oturumu oluşturur |
| `/game-sessions` | GET | Oyun oturumlarını listeler |
| `/game-sessions/{sessionId}` | GET | Belirli bir oyun oturumunun detaylarını getirir |
| `/game-sessions/{sessionId}` | PUT | Oyun oturumu bilgilerini günceller |
| `/game-sessions/{sessionId}` | DELETE | Oyun oturumunu siler |
| `/game-sessions/active` | GET | Aktif oyun oturumlarını listeler |
| `/game-sessions/my` | GET | Kullanıcının kendi oyun oturumlarını listeler |

## Katılımcı Yönetimi

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/game-sessions/{sessionId}/join` | POST | Bir oyun oturumuna katılır |
| `/game-sessions/{sessionId}/leave` | POST | Bir oyun oturumundan ayrılır |
| `/game-sessions/{sessionId}/participants` | GET | Oyun oturumundaki katılımcıları listeler |
| `/game-sessions/{sessionId}/kick/{userId}` | POST | Bir kullanıcıyı oyun oturumundan atar |
| `/game-sessions/{sessionId}/invite` | POST | Bir kullanıcıyı oyun oturumuna davet eder |

## Oyun Durumu

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/game-sessions/{sessionId}/state` | GET | Oyun oturumunun mevcut durumunu getirir |
| `/game-sessions/{sessionId}/state` | PUT | Oyun oturumunun durumunu günceller |
| `/game-sessions/{sessionId}/start` | POST | Oyun oturumunu başlatır |
| `/game-sessions/{sessionId}/end` | POST | Oyun oturumunu sonlandırır |
| `/game-sessions/{sessionId}/pause` | POST | Oyun oturumunu duraklatır |
| `/game-sessions/{sessionId}/resume` | POST | Duraklatılmış oyun oturumunu devam ettirir |

## Eşleştirme Sistemi

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/games/{gameId}/matchmaking/join` | POST | Eşleştirme kuyruğuna katılır |
| `/games/{gameId}/matchmaking/leave` | POST | Eşleştirme kuyruğundan ayrılır |
| `/matchmaking/status` | GET | Kullanıcının eşleştirme durumunu kontrol eder |
| `/matchmaking/skill/{gameId}` | GET | Belirli bir oyun için kullanıcının beceri seviyesini getirir |
| `/matchmaking/leaderboard/{gameId}` | GET | Oyun için beceri seviyesi sıralamasını getirir |

## Turnuvalar

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/tournaments` | GET | Turnuvaları listeler |
| `/tournaments/{tournamentId}` | GET | Belirli bir turnuvanın detaylarını getirir |
| `/tournaments/{tournamentId}/register` | POST | Bir turnuvaya kayıt olur |
| `/tournaments/{tournamentId}/unregister` | POST | Turnuva kaydını iptal eder |
| `/tournaments/{tournamentId}/participants` | GET | Turnuva katılımcılarını listeler |
| `/tournaments/{tournamentId}/matches` | GET | Turnuva maçlarını listeler |
| `/tournaments/{tournamentId}/matches/{matchId}` | GET | Belirli bir turnuva maçının detaylarını getirir |
| `/tournaments/{tournamentId}/matches/{matchId}/result` | POST | Maç sonucunu bildirir |

## Oyun Sunucuları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/gameserver/servers` | GET | Mevcut oyun sunucularını listeler |
| `/gameserver/servers/{serverId}` | GET | Belirli bir oyun sunucusunun detaylarını getirir |
| `/gameserver/servers/{serverId}/status` | GET | Oyun sunucusunun durumunu kontrol eder |

## Başarılar

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/achievements/game/{gameId}` | GET | Belirli bir oyun için mevcut başarıları listeler |
| `/achievements/user/{userId}/game/{gameId}` | GET | Kullanıcının belirli bir oyundaki başarılarını listeler |
| `/achievements/unlock/{achievementId}` | POST | Bir başarının kilidini açar |

## Raporlama

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/reports/game` | POST | Bir oyunu raporlar |
| `/reports/player` | POST | Bir oyuncuyu raporlar |
| `/reports/game-session` | POST | Bir oyun oturumunu raporlar |