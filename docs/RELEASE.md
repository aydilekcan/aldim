# Yayın öncesi kalan işler

9 Eylül 2026: Kullanıcı test e-postasının gelen kutusuna ve cihaz içi test bildiriminin telefonuna ulaştığını doğruladı.

- [ ] iPhone: Apple imzalama, cihaz kaydı, EAS development build ve APNs anahtarı. Uygulama kapalıyken sunucudan tek hesaba push gönderimini, Expo receipt sonucunu ve bildirime dokununca doğru kaydın açılmasını doğrula.
- [ ] E-posta üretimi: Kullanıcıya ait alan adı alınıp Resend DNS doğrulaması tamamlanmalı. Doğrulanmış göndericiye geçildikten sonra test alıcısı kısıtı kaldırılmalı; normal cron akışı doğrulanmalı.
- [ ] SMS: Netgsm hesabı, SMS API yetkileri, onaylı gönderici başlığı ve bakiye. Kullanıcının test telefonu/tercihiyle gerçek teslimi doğrula.
- [ ] Android: FCM v1 kimlik bilgileri, test APK'sı, kamera/PDF ve uygulama kapalıyken uzaktan push testi.
- [ ] E-posta tasarımı — kullanıcı özellikle sonraya bıraktı: Aldım'ın web/mobil görsel diliyle uyumlu HTML şablonları; belirgin kayıt adı ve tarih, okunaklı tutar varsa gösterimi, “Kaydı aç” düğmesi, tercih bağlantısı ve düz metin alternatifi. Konu ve içerik bugünü/yarını/geçmiş tarihi doğru ifade etmeli. Gmail ve iPhone Mail'de mobil görünüm kontrolü.
- [ ] Son ürün testi: Mobil yeni ekranlar, hesaplar arası erişim, kayıt/belge/ödeme/servis akışları; App Store ve Google Play bilgileri, gizlilik beyanları, ekran görüntüleri ve mağaza incelemesine gönderim.

İlk adım: `bash scripts/ios-test.command credentials`. Apple şifresi ve doğrulama kodu kullanıcı tarafından Terminal'e girilir; sohbet veya kaynak koda yazılmaz. Ayrıntılı kurulum: [Bildirimler](NOTIFICATIONS.md).
