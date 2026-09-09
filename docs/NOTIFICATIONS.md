# Bildirim kurulumu ve test

## Sağlayıcı hesapları

- E-posta: [Resend](https://resend.com/signup). Gönderim alan adı kullanıcıya ait olmalı; `aldim.vercel.app` doğrulanamaz. Satın alınan alan adının DNS paneline Resend’in verdiği SPF/DKIM kayıtlarını ekle. Web sitesini aynı anda taşımak gerekmez.
- SMS: [Netgsm](https://www.netgsm.com.tr/). SMS API yetkili alt kullanıcı aç, gönderici başlığını onaylat ve yeterli SMS bakiyesi ekle. Hatırlatma içerikleri bilgilendirme amaçlıdır; pazarlama gönderimi bu entegrasyona dahil değildir.
- iOS uzaktan bildirim: Apple Developer + Expo EAS. Expo Go içindeki cihaz testi, APNs üzerinden uzaktan teslimi kanıtlamaz.
- Android uzaktan bildirim: Firebase projesi/FCM v1 servis hesabı ve EAS Android push kimlik bilgileri gerekir.

## Gizli ayarlar

Supabase projesinde **Edge Functions → Secrets** bölümüne ekle. Değerleri sohbete, GitHub’a veya mobil uygulamaya koyma.

| Kanal | Ayar |
| --- | --- |
| Resend | `RESEND_API_KEY`, `REMINDER_FROM_EMAIL` (`Aldım <hatirlatma@dogrulanmis-alan-adin>` biçimi) |
| Netgsm | `SMS_PROVIDER=netgsm`, `NETGSM_USERNAME`, `NETGSM_PASSWORD`, `NETGSM_MSGHEADER` |
| Alternatif Twilio | `SMS_PROVIDER=twilio`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` |

SMS sağlayıcısı açıkça seçilir; belirsiz gönderimde başka sağlayıcıya otomatik geçilmez. Netgsm kullanıcı adı, API dokümanındaki abone numarası; şifre SMS yetkisi verilmiş API alt kullanıcısına aittir. Sonraki normal cron çalışması kanal kurulum durumunu günceller. “Etkin” bilgisi ayarların bulunduğunu gösterir, teslim garantisi değildir.

## Alan adı olmadan yalnızca kendi adresine e-posta testi

Resend hesabını test edeceğin e-posta adresiyle aç. Secrets: `RESEND_API_KEY`, `REMINDER_FROM_EMAIL=Aldım <onboarding@resend.dev>`, `REMINDER_EMAIL_TEST_TO=<Resend hesap adresin>`. Bu modda genel e-posta kanalı kapalı kalır; sadece `user_id` + `reminder_id` ile sınırlandırılmış yönetici çağrısı tam olarak bu adrese gönderebilir. Normal cron bu test ayarlarıyla e-posta göndermez. Alan adı doğrulanınca göndericiyi değiştir ve `REMINDER_EMAIL_TEST_TO` ayarını kaldır.

[Resend test alanı sınırı](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain)

## iPhone test uygulaması

Proje kökünden:

```bash
bash scripts/ios-test.command credentials
bash scripts/ios-test.command device
bash scripts/ios-test.command build
```

1. Apple hesabına Terminal üzerinden giriş yap; development profiline ait imzalamayı tamamla.
2. Cihaz kaydında verilen bağlantıyı iPhone Safari’de aç, kayıt profilini tamamla. Yeni cihazı içeren provisioning profile gerekir.
3. Derleme tamamlanınca EAS kurulum bağlantısını telefonda aç. iOS Geliştirici Modu gerekiyorsa Ayarlar → Gizlilik ve Güvenlik’ten etkinleştir.
4. EAS Credentials içindeki iOS Push Notifications bölümünde APNs anahtarının yapılandırıldığını doğrula.
5. `bash scripts/ios-test.command start` ile Metro’yu aç; aynı ağdaki telefonda Aldım test uygulamasıyla bağlan.
6. Aldım hesabına giriş yap, bildirim iznini aç ve tercihlerini kaydet. Cihaz kaydı bu aşamada sunucuya yazılır.

## Testin üç ayrı aşaması

- **Cihaz testi:** Ayarlar → Bildirimini dene → Test bildirimi oluştur. Uygulamayı arka plana al. 10 saniye sonra en yakın yaklaşan kaydın test bildirimi görünmeli. Bildirime dokununca doğru kaydı açmalı. Kayıt tarihi/ödeme durumu değişmez. Bu test için SMS/e-posta/push sağlayıcısı gerekmez.
- **Uzaktan push:** Gerçek test derlemesinde izin sonrası `device_tokens` kaydı doğrulanır. Yalnızca test hesabının hatırlatması için kapsamlı çağrı yapılır. Expo ticket kabulü ve receipt ayrı kontrol edilir; telefonda görünme kullanıcı tarafından doğrulanır.
- **SMS/e-posta:** Sağlayıcılar yapılandırıldıktan sonra test hesabının tercihleri ve alıcı bilgileri kontrol edilir. Aktif push cihazı varsa normal dağıtıcı önce push kullanır. SMS/e-posta testinde bu tercih açıkça yönetilir; diğer kullanıcıların bildirimleri tetiklenmez.

## Tek hatırlatma için yönetici testi

`reminder-dispatch` POST çağrısı mevcut `x-cron-secret` doğrulamasını gerektirir. Sorgu parametreleri:

```
?user_id=<test-hesabi-uuid>&reminder_id=<o-hesabin-hatirlatma-uuid>&dry_run=true
```

İki kimlik birlikte zorunludur. Eksik/bozuk kimlik `400` döndürür. İkisi de sorguya AND koşuluyla eklenir. `dry_run=true` hiçbir kayıt değiştirmez veya gönderim yapmaz. Gerçek gönderim için dry_run kaldırılır; takvim, tercihler ve mükerrer gönderim koruması devam eder. Kapsamlı test diğer kullanıcıların teslim kayıtlarını incelemez/güncellemez. Tam cron’u test amacıyla tetikleme.

`accepted` sağlayıcının isteği kabul ettiğini; push `delivered` Expo receipt’in başarılı olduğunu gösterir. SMS için Netgsm jobid tutulur; gerçek teslim sağlayıcı raporundan doğrulanır. `unknown` durumunda sağlayıcı kontrol edilmeden tekrar gönderilmez.

API: [Netgsm REST v2](https://www.netgsm.com.tr/dokuman/), [Resend domain doğrulama](https://resend.com/docs/dashboard/domains/introduction).
