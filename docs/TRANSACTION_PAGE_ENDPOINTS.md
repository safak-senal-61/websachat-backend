# İşlemler Sayfası Endpointleri

Bu belge, WebSaChat uygulamasının işlemler (transactions) sayfasında kullanılabilecek tüm API endpointlerini listeler.

## Bakiye ve İşlem Geçmişi

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/transactions/balance/me` | GET | Kullanıcının bakiyesini getirir |
| `/transactions/me` | GET | Kullanıcının işlem geçmişini listeler |
| `/transactions/{transactionId}` | GET | Belirli bir işlemin detaylarını getirir |
| `/transactions/summary` | GET | İşlem özeti ve istatistiklerini getirir |

## Para Yükleme

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/transactions/deposit` | POST | Hesaba para yükler |
| `/transactions/deposit/methods` | GET | Kullanılabilir para yükleme yöntemlerini listeler |
| `/transactions/deposit/calculate-fee` | POST | Para yükleme işlemi için ücret hesaplar |
| `/transactions/deposit/verify` | POST | Para yükleme işlemini doğrular |
| `/transactions/deposit/cancel` | POST | Para yükleme işlemini iptal eder |

## Para Çekme

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/transactions/withdraw` | POST | Hesaptan para çeker |
| `/transactions/withdraw/methods` | GET | Kullanılabilir para çekme yöntemlerini listeler |
| `/transactions/withdraw/calculate-fee` | POST | Para çekme işlemi için ücret hesaplar |
| `/transactions/withdraw/verify` | POST | Para çekme işlemini doğrular |
| `/transactions/withdraw/cancel` | POST | Para çekme işlemini iptal eder |

## Para Birimi Dönüştürme

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/transactions/convert/diamonds-to-coins` | POST | Elmasları madeni paralara dönüştürür |
| `/transactions/convert/coins-to-diamonds` | POST | Madeni paraları elmaslara dönüştürür |
| `/transactions/convert/rates` | GET | Dönüştürme oranlarını getirir |
| `/transactions/convert/calculate` | POST | Dönüştürme miktarını hesaplar |

## Hediye Gönderme ve Alma

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/gifts/{giftModelId}/send` | POST | Bir hediye gönderir |
| `/gifts/received` | GET | Alınan hediyeleri listeler |
| `/gifts/sent` | GET | Gönderilen hediyeleri listeler |
| `/gifts/models` | GET | Mevcut hediye modellerini listeler |

## Abonelikler

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/subscription/plans` | GET | Abonelik planlarını listeler |
| `/subscription/subscribe` | POST | Bir abonelik planına abone olur |
| `/subscription/cancel` | POST | Aboneliği iptal eder |
| `/subscription/status` | GET | Abonelik durumunu getirir |
| `/subscription/history` | GET | Abonelik geçmişini listeler |
| `/subscription/payment-methods` | GET | Abonelik ödeme yöntemlerini listeler |
| `/subscription/payment-methods` | POST | Yeni bir ödeme yöntemi ekler |
| `/subscription/payment-methods/{methodId}` | DELETE | Bir ödeme yöntemini siler |
| `/subscription/payment-methods/{methodId}/set-default` | POST | Bir ödeme yöntemini varsayılan olarak ayarlar |

## Ödeme Yöntemleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/payment-methods` | GET | Ödeme yöntemlerini listeler |
| `/payment-methods` | POST | Yeni bir ödeme yöntemi ekler |
| `/payment-methods/{methodId}` | GET | Belirli bir ödeme yönteminin detaylarını getirir |
| `/payment-methods/{methodId}` | PUT | Bir ödeme yöntemini günceller |
| `/payment-methods/{methodId}` | DELETE | Bir ödeme yöntemini siler |
| `/payment-methods/{methodId}/set-default` | POST | Bir ödeme yöntemini varsayılan olarak ayarlar |

## Faturalar

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/invoices` | GET | Faturaları listeler |
| `/invoices/{invoiceId}` | GET | Belirli bir faturanın detaylarını getirir |
| `/invoices/{invoiceId}/download` | GET | Bir faturayı indirir |
| `/invoices/{invoiceId}/pay` | POST | Bir faturayı öder |

## Promosyonlar ve Kuponlar

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/promotions` | GET | Mevcut promosyonları listeler |
| `/promotions/{promotionId}` | GET | Belirli bir promosyonun detaylarını getirir |
| `/promotions/{promotionId}/redeem` | POST | Bir promosyonu kullanır |
| `/coupons/redeem` | POST | Bir kuponu kullanır |
| `/coupons/validate` | POST | Bir kuponun geçerliliğini kontrol eder |

## Vergi ve Yasal Bilgiler

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/tax-information` | GET | Vergi bilgilerini getirir |
| `/tax-information` | PUT | Vergi bilgilerini günceller |
| `/tax-documents` | GET | Vergi belgelerini listeler |
| `/tax-documents/{documentId}` | GET | Belirli bir vergi belgesinin detaylarını getirir |
| `/tax-documents/{documentId}/download` | GET | Bir vergi belgesini indirir |
| `/legal/terms-of-service` | GET | Hizmet şartlarını getirir |
| `/legal/privacy-policy` | GET | Gizlilik politikasını getirir |
| `/legal/refund-policy` | GET | İade politikasını getirir |