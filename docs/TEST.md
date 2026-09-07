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

- 15 test: tarih/para, garanti/servis hatırlatma üretimi, eski veri sahipliği, harcama/yenileme bozuk görsel güvenliği ve geçici oturum zamanlaması.
- 11 canlı Supabase testi: iki hesapla oturum, kayıt/hatırlatma atomikliği, RLS, private dosya, eski sürüm çatışması, servis takibi, eşzamanlı ödemenin tekilleşmesi, silinen kaydın geri gelmemesi, tercihler ve iki aylık fatura.
- Web ve mobil TypeScript, web lint ve Next.js üretim derlemesi başarılı.
- iOS + Android Hermes üretim paketleri başarılı. iPhone 17 / iOS 26.5 simülatöründe gerçek hesap girişi, webdeki kayıtların görünmesi, fotoğrafın açılması ve 25 KB PDF oluşturularak iOS paylaşım ekranına ulaşılması doğrulandı.
- Tarayıcı: giriş, ürün oluşturma, 1.250,50 TL tutar, fotoğraf yükleme, geçerli tek sayfa PDF indirme, masaüstü/390px telefon görünümü. Yatay taşma yok.
- Bildirim fonksiyonu: yetkisiz çağrı 401; yetkili dry-run 200. Gerçek alıcılara test mesajı gönderilmedi.
- Oluşturulan 2 Supabase test hesabı ve 4 test dosyası temizlendi; gerçek kullanıcı kayıtları korunmuştur.
