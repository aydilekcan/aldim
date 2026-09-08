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

SMS/e-posta sağlayıcıları henüz bağlı olmadığından bu iki kanaldan gerçek gönderim beklenmemelidir. Expo EAS hesabına giriş ve APNs/FCM kurulumu tamamlanmadan uzaktan push için uçtan uca teslim testi yapılamaz. Ana README kurulum adımlarını içerir.

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
