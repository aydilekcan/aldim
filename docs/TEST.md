# Son kullanıcı testi

Web: https://aldim.vercel.app

Son doğrulama: 7 Eylül 2026. Vercel production yayını READY; Supabase hatırlatma Cron görevi etkin. Kaynaklar GitHub `codex/unify-web-mobile` dalına gönderildi.

1. Hesap oluştur veya giriş yap. Aynı hesapla mobil uygulamaya gir.
2. Bir ürün ekle: fiyat 1.250,50 TL, satın alma tarihi, garanti bitişi.
3. Fatura/garanti fotoğrafını yükle. Belge kasasından PDF indir. Diğer cihazda aynı belgenin açıldığını kontrol et.
4. Ürüne servis kaydı ve sonraki takip tarihi ekle. Hatırlatmalar listesinde görünmesini kontrol et.
5. Bir abonelik ekle; aylık/yıllık dönemini seç. Bir faturayı ödendi işaretle. Harcama toplamının artıp sıradaki tarihin doğru ilerlediğini kontrol et.
6. Kayıt düzenle/arşivle/sil. Diğer cihazda yenilediğinde değişikliği kontrol et.
7. Gerçek iPhone/Android development build üzerinde kamera, PDF paylaşımı, bildirim izni ve bildirime dokunarak doğru kayda açılmayı dene.

Güncel kanal durumu (10 Eylül): Resend test e-postası gerçek gelen kutusunda doğrulandı; herkese gönderim için alan adı gerekiyor. SMS hesabı ve Android FCM kurulumu bekliyor. iOS imzalama/APNs ve ilk cihaz derlemesi tamamlandı; telefona kurulum ve uzaktan push teslim testi sıradaki adım. Ayrıntılar aşağıdaki tarihli test kayıtlarında.

## Otomatik doğrulama

- 16 test: tarih/para, garanti/servis hatırlatma üretimi, eski veri sahipliği, harcama/yenileme ve geçici oturum zamanlaması.
- 11 canlı Supabase testi: iki hesapla oturum, kayıt/hatırlatma atomikliği, RLS, private dosya, eski sürüm çatışması, servis takibi, eşzamanlı ödemenin tekilleşmesi, silinen kaydın geri gelmemesi, tercihler ve iki aylık fatura.
- Web ve mobil TypeScript, web lint ve Next.js üretim derlemesi başarılı.
- iOS + Android Hermes üretim paketleri başarılı. iPhone 17 / iOS 26.5 simülatöründe gerçek hesap girişi, webdeki kayıtların görünmesi, fotoğrafın açılması ve 25 KB PDF oluşturularak iOS paylaşım ekranına ulaşılması doğrulandı.
- Tarayıcı: giriş, ürün oluşturma, 1.250,50 TL tutar, fotoğraf yükleme, geçerli tek sayfa PDF indirme, masaüstü/390px telefon görünümü. Yatay taşma yok.
- Bildirim fonksiyonu: yetkisiz çağrı 401; yetkili dry-run 200. Gerçek alıcılara test mesajı gönderilmedi.
- Oluşturulan 2 Supabase test hesabı ve 4 test dosyası temizlendi; gerçek kullanıcı kayıtları korunmuştur.

## Kullanıcı geri bildirimi — 7 Eylül

- Web ve mobil tutar alanları binlik ayırıcı kullanır; 235000 → 235.000 ₺, kuruşlar korunur. Ortak testler sayı/form dönüşümünde tutarın değişmediğini kontrol eder.
- Satın alma tarihi bugünü geçemez. Webde Türkçe alan uyarısı, mobilde tarih seçici sınırı ve ortak kayıt doğrulaması vardır. Supabase trigger kontrolü gelecekteki bir ekleme isteğiyle rollback içinde doğrulandı; mevcut kayıtlar değiştirilmedi.
- İzole tarayıcıda sahte ağ yanıtlarıyla yazma, silme, kuruş ekleme, ondalıklı tutar yapıştırma, gelecek tarih uyarısı ve geçerli tarihle uyarının kalkması doğrulandı. Bu görsel test için gerçek kullanıcı verisi kullanılmadı.
- Sıcak beyaz/koyu mürekkep/kiremit paleti, daha küçük hızlı işlemler, sade harcama özeti ve daha okunaklı form alanları web ve mobile uygulandı. 390 px görünümde yatay taşma yok.
- Terminalde pnpm bulunmaması için scripts/expo-login.command eklendi. --check ile bu bilgisayarda Node 24.19.0 ve pnpm 11.19.0 doğrulandı; gerçek Expo girişi kullanıcı tarafından tamamlanmalı.

## Expo SDK 57 — 8 Eylül

- SDK 57.0.20, React Native 0.86.3 ve React 19.2.3 uyumu sağlandı.
- Expo Doctor: 21/21; ortak testler: 16/16; web lint ve web/mobil TypeScript başarılı.
- SDK 57 ile iOS ve Android Hermes üretim paketleri başarıyla oluşturuldu.
- Eski Metro ile birlikte image-size bağımlılığı kaldırıldı. Sadece o bağımlılığa ait yama ve iki test temizlendi.
- Expo Go içinde desteklenmeyen uzaktan push kaydı denenmez; gerçek push için development/production build kullanılır.

## Bildirim entegrasyonu ve mobil düzenleme — 9 Eylül

- Ortak otomatik testler 21/21: Netgsm kabul/hata/belirsiz yanıtları, test alıcısı sınırı ve tek hatırlatma kapsamı dahil. Web/mobil TypeScript ve değişen mobil dosyalarda ESLint başarılı. Deno Edge Function tip kontrolü başarılı.
- iOS ve Android Hermes JavaScript üretim paketleri oluşturuldu. Bunlar imzalı IPA/APK değildir; iPhone cihaz kurulumu Apple oturumu, cihaz kaydı ve EAS derlemesi bekliyor.
- Netgsm REST v2 entegrasyonu Supabase reminder-dispatch v4 ile yayımlandı; Netgsm hesap bilgileri henüz eklenmedi.
- Resend yalnızca test hesabına gönderim modunda bağlandı. Hesap sahibinin Netflix hatırlatması için kapsamlı POST 200, tek e-posta kabulü ve Resend panelinde Delivered durumu 9 Eylül'de doğrulandı. Normal cron test göndericisiyle e-posta göndermez; üretim için doğrulanmış alan adı gerekir.
- Kayıt satırlarında tutar, kayıtlarda/belgelerde arama, sade tarih satırları ve ana sayfada daha yukarıda hatırlatmalar. Ayarlarda 10 saniyelik cihaz bildirim testi eklendi. Kullanıcı 9 Eylül'de test bildiriminin gerçek telefonuna geldiğini doğruladı; bu cihaz içi testtir, uzaktan push teslimini doğrulamaz.
- Expo development/preview/production ortamlarına yalnızca public Supabase bağlantı bilgileri eklendi. Sunucu anahtarları mobil pakette bulunmaz.
- Son ekranların görsel ve cihaz üstü testi hâlâ bekliyor; önceki sürümün simülatör kontrolleri bu yeni tasarımın onayı sayılmaz.
- Kullanıcı 9 Eylül'de Netflix e-postasının gelen kutusuna ulaştığını ekran görüntüsüyle doğruladı. E-posta şu an düz metindir; tasarım çalışması kullanıcının isteğiyle sonraya bırakıldı. Yayın öncesi işler: [Yayın listesi](RELEASE.md).

## iOS imzalama hazırlığı — 9 Eylül

- Kullanıcının Apple oturumu CLI üzerinden başarıyla geri yüklendi. Aldım için Apple Distribution Certificate oluşturuldu.
- APNs anahtarı oluşturuldu ve `com.aldim.app` / Expo `aldim-mobile` projesine atandı. Gizli anahtarlar kaynak koda eklenmedi.
- Cihaz kaydı ve imzalı IPA bu hazırlığın ardından 10 Eylül'de tamamlandı; sonuç aşağıda.
- Kullanılmayan EAS Update kanal ayarları kaldırıldı; proje expo-updates kullanmadığından test derlemesinde gereksiz kurulum istemi çıkmamalı.

## İmzalı iPhone test uygulaması — 10 Eylül

- Kullanıcının iPhone'u Ad Hoc profile dahil edildi. Apple dağıtım sertifikası ve APNs yapılandırması EAS tarafından doğrulandı.
- EAS development build `d7be3a22-f4a9-4542-97c8-54f2fabd08e1`: **FINISHED**, 10 Eylül 2026 10:56 Türkiye saati. Sürüm 0.1.0, derleme 1; kaynak commit `07f4a16`.
- [iPhone kurulum sayfası](https://expo.dev/accounts/aydilekcan/projects/aldim-mobile/builds/d7be3a22-f4a9-4542-97c8-54f2fabd08e1). Bu bir development build; App Store/TestFlight yayını değildir ve açılış için yerel geliştirme sunucusu gerekir.
- Metro `--dev-client --lan` ile başlatıldı. Doğru Expo project ID doğrulandı; iOS geliştirme paketi HTTP 200 ile derlendi (11.097.562 bayt).
- Kullanıcının hesabında kurulum öncesi kayıtlı push cihazı bulunmadığı doğrulandı. Telefona kurulum, hesap girişi, bildirim izni, tek cihaza uzaktan test ve bildirime dokunarak Netflix kaydını açma henüz doğrulanmadı.
- Netflix'in gerçek ödeme tarihi test için değiştirilmedi. Geçmiş tarihli kaydı normal cron ile zorlamak yerine açıkça test olarak etiketlenmiş tek cihaz gönderimi yapılmalı.
