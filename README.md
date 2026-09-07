# Aldım

Faturalarını, garanti belgelerini, harcamalarını ve önemli tarihlerini tek hesapta saklayan web, iOS ve Android uygulaması.

## Tek proje

- `app/`, `components/`, `lib/`: Next.js web uygulaması.
- `mobile/`: Expo / React Native iOS ve Android uygulaması.
- `shared/`: ortak kategori formları, veri tipleri, tarih ve harcama hesapları, Supabase işlemleri ve eski veriyi içeri aktarma.
- `supabase/migrations/`: canlı veritabanına uygulanmış, sıralı geçişler.
- `supabase/functions/reminder-dispatch/`: push, e-posta ve SMS dağıtıcısı.
- `tests/`: iş kuralları ve iki hesapla canlı entegrasyon kontrolleri.

Eski bağımsız mobil klasör, veri kaybı olmadan `backups/aldim-mobile-original` altına taşınmıştır. Başlangıç kaynak kodu arşivi de `backups/` içindedir. Yedekler Git, Vercel, TypeScript ve Metro kapsamı dışındadır; aktif kaynak `mobile/` klasörüdür.

Web ve mobil aynı Supabase projesini kullanır. Eski tarayıcı verileri Ayarlar'dan içeri alınabilir. Eski mobil kayıtlar yalnızca ait oldukları kullanıcı için aktarılır; özgün yerel veri silinmez. Bulut, kayıtların tek yetkili kaynağıdır. Mobil çevrimdışıyken son indirilen kayıtları gösterir; yeni kayıt/değişiklik için bağlantı gerekir.

## Çalıştırma

Node.js 22 veya üzeri ve Corepack / pnpm 11.19.0 kullanın.

```sh
corepack pnpm install --frozen-lockfile
cp .env.example .env.local
cp mobile/.env.example mobile/.env.local
# İki dosyaya aynı Supabase URL ve public/publishable anahtarını girin.
pnpm dev
pnpm ios
pnpm android
```

Web: `http://localhost:3000`. Native: Expo Go ile ekran kontrolü; gerçek push bildirimi için Expo development/production build gerekir. `service_role`, Resend ve Twilio sırları web veya mobil dosyalara konmaz.

## Kontroller

```sh
pnpm check
pnpm mobile:check
pnpm build
cd mobile
pnpm exec expo export --platform ios --platform android --output-dir dist-native --max-workers 2
```

`tests/integration.ts` canlı sisteme test kayıtları yazar. Yalnızca iki ayrı, silinebilir test hesabıyla çalıştırın; fixture JSON biçimi `[{"id":"uuid","email":"...","password":"..."}, ...]` şeklindedir. Fixture ve anahtarları Git'e eklemeyin. Testten sonra oluşturulan dosyalar ve hesaplar temizlenmelidir.

```sh
ALDIM_TEST_USERS_FILE=/secure/path/test-users.json node --env-file=.env.local --import tsx tests/integration.ts
```

## Kapsam

Ürün, araç, fatura, sigorta, abonelik ve servis kategorileri; dinamik kayıt formları; garanti / ödeme / yenileme / servis takip tarihleri; belge fotoğrafı veya PDF yükleme; görseli PDF'e çevirerek indirme/paylaşma; servis geçmişi; arama ve filtreler; harcama özeti; ödemeyi işaretleme; aylık, iki aylık, üç aylık ve yıllık yenilemeler.

Belge kasası private Supabase Storage kullanır. İndirme bağlantıları 5 dakika geçerlidir. JPG, PNG, WebP ve PDF kabul edilir; sınır 6 MB'dır. Silinen kayıt ve belge metadata'sı tombstone olarak tutulur; private dosya kurtarma için saklanır. Otomatik kalıcı dosya temizliği etkin değildir.

Kullanıcı izolasyonu RLS ile veritabanında uygulanır. Kayıt + hatırlatma kaydı atomiktir. Eski cihazın güncellemesi daha yeni kaydı sessizce ezemez. Aynı ödeme eşzamanlı iki kez işaretlense bile tek ödeme oluşur.

## Yayın

Mevcut Vercel projesi: `aldim`, web adresi: https://aldim.vercel.app. Proje kökü bu klasördür; `mobile/` olarak değiştirilmez. `vercel.json` workspace kurulumunu tanımlar. Vercel'de `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` bulunmalıdır.

Supabase Auth → URL Configuration:

- Site URL: `https://aldim.vercel.app`
- Redirect URL: `https://aldim.vercel.app/app`
- Redirect URL: `https://aldim.vercel.app/auth/reset`
- Yerel test gerektiğinde `http://localhost:3000/**` ve `http://127.0.0.1:3000/**` ekleyin.

Hesap doğrulama ve şifre yenileme e-postaları Supabase Auth üzerinden gider. Üretim e-posta hacmi için Supabase SMTP yapılandırması ayrıca gereklidir.

## Hatırlatma kanalları

Supabase Cron, Türkiye saatiyle 10:00–21:00 arasında saatlik çalışır. Aynı hatırlatma/tarih/kanal/hedef için tekrarlı gönderim engellenir. Kabul, teslim ve hata durumları ayrı tutulur; belirsiz sağlayıcı yanıtları körlemesine yeniden gönderilmez. Uygulama bildirimi için son 30 gün içinde etkin cihaz kaydı tercih edilir. Cihazı olmayan kullanıcıda açık tercihine göre e-posta ve SMS denenir.

Push için Expo projesi `f5bfa130-617b-4542-b5be-1b45a6f46ac5` kullanılır. Apple APNs / Android FCM kimlikleri EAS üzerinde hazırlanmalıdır. Expo Go, üretim push testinin yerine geçmez.

E-posta ve SMS sağlayıcıları bağlı değildir. Etkinleştirmek için Supabase Edge Function secrets alanına şu değerleri ekleyin:

- E-posta: `RESEND_API_KEY`, `REMINDER_FROM_EMAIL` (doğrulanmış gönderici).
- SMS: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`.

Dağıtıcının sonraki çalışması kanal durumunu günceller. SMS telefonu uluslararası `+905xxxxxxxxx` biçiminde girilir. Gönderim tercihleri kullanıcı tarafından değiştirilebilir.

Cron çağrısı `x-cron-secret` başlığıyla doğrulanır. Sır Supabase Vault'ta `aldim_reminder_cron` adıyla tutulur; kaynak kod yalnızca SHA-256 özetini içerir. Yeni ortama kurarken güçlü yeni sır oluşturun, özeti `config.ts` içinde güncelleyin, Vault'a sırrı kaydedin ve fonksiyonu tekrar yayınlayın. `supabase/scheduler.sql` zamanlayıcı tanımıdır. Canlı ortama migration'ları ikinci kez uygulamayın.

## iOS / Android dağıtımı

`mobile/eas.json` development, simulator, preview APK ve production profillerini içerir. Mevcut Expo hesabına giriş yapıldıktan sonra:

```sh
cd mobile
bash ../scripts/expo-login.command
pnpm dlx eas-cli build --platform android --profile preview
pnpm dlx eas-cli build --platform ios --profile development-simulator
# Mağaza paketleri: eas build --platform all --profile production
```

Bu çalışma sırasında EAS hesabı oturumu olmadığı için imzalı APK/IPA veya mağaza gönderimi yapılmadı. iOS/Android JavaScript paketlerinin başarıyla derlenmesi, fiziksel cihazda push ve kamera testinin yerine geçmez.

## Bağımlılık güvenliği

Next.js 15.5.21, Supabase 2.106.2 ve ilgili PostCSS/sharp/UUID/URL çözümleme düzeltmeleri uygulanmıştır. Metro'nun `image-size@1.2.1` bağımlılığı için iki bozuk görsel döngüsüne uzunluk sınırı yaması `patches/` altında tutulur ve pnpm tarafından otomatik uygulanır. Sürüm tabanlı `pnpm audit` bu iki uyarıyı göstermeye devam edebilir; yama davranışı `tests/image-safety.test.ts` ile ayrı süreç ve zaman aşımı kullanılarak doğrulanır. Yayımlanmış uyumlu upstream düzeltme geldiğinde yama kaldırılıp sürüm yükseltilmelidir.

Terminalde `pnpm: command not found` görülürse proje kökünden `bash scripts/expo-login.command` çalıştırın. Komut bilgisayardaki mevcut Node/pnpm ortamını bulur; shell ayarlarınızı değiştirmez. Giriş bilgilerinizi yalnızca Expo'nun terminal istemine girin.
