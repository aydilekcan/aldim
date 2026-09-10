# Yayın öncesi kalan işler

9 Eylül 2026: Kullanıcı test e-postasının gelen kutusuna ve cihaz içi test bildiriminin telefonuna ulaştığını doğruladı.

- [x] iPhone hazırlığı: Apple imzalama, cihaz kaydı, APNs anahtarı ve EAS development build 10 Eylül'de tamamlandı. [Kurulum](https://expo.dev/accounts/aydilekcan/projects/aldim-mobile/builds/d7be3a22-f4a9-4542-97c8-54f2fabd08e1).
- [ ] iPhone cihaz testi: İmzalı Aldım uygulamasını kur; hesap girişi ve bildirim izninden sonra uygulama kapalıyken sunucudan tek hesaba push gönderimini, Expo receipt sonucunu ve bildirime dokununca doğru kaydın açılmasını doğrula.
- [ ] E-posta üretimi: Kullanıcıya ait alan adı alınıp Resend DNS doğrulaması tamamlanmalı. Doğrulanmış göndericiye geçildikten sonra test alıcısı kısıtı kaldırılmalı; normal cron akışı doğrulanmalı.
- [ ] SMS: Netgsm hesabı, SMS API yetkileri, onaylı gönderici başlığı ve bakiye. Kullanıcının test telefonu/tercihiyle gerçek teslimi doğrula.
- [ ] Android: FCM v1 kimlik bilgileri, test APK'sı, kamera/PDF ve uygulama kapalıyken uzaktan push testi.
- [ ] E-posta tasarımı — kullanıcı özellikle sonraya bıraktı: Aldım'ın web/mobil görsel diliyle uyumlu HTML şablonları; belirgin kayıt adı ve tarih, okunaklı tutar varsa gösterimi, “Kaydı aç” düğmesi, tercih bağlantısı ve düz metin alternatifi. Konu ve içerik bugünü/yarını/geçmiş tarihi doğru ifade etmeli. Gmail ve iPhone Mail'de mobil görünüm kontrolü.
- [ ] Son ürün testi: Mobil yeni ekranlar, hesaplar arası erişim, kayıt/belge/ödeme/servis akışları; App Store ve Google Play bilgileri, gizlilik beyanları, ekran görüntüleri ve mağaza incelemesine gönderim.

Sıradaki adım: Hazır iPhone uygulamasını yukarıdaki bağlantıdan kurmak. Geliştirme sunucusu gerektiğinde `bash scripts/ios-test.command start` ile açılır. Apple imzalama hazırlığını yeniden yapmak gerekmez. Ayrıntılı kurulum: [Bildirimler](NOTIFICATIONS.md).
