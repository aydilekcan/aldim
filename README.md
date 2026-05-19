# Aldım

**Faturan, garantin, iaden tek yerde.**

Aldım, satın aldığın ürünlerin faturalarını, garanti sürelerini, iade haklarını ve servis kayıtlarını tek yerden takip etmeni sağlayan, mobil öncelikli bir alışveriş sonrası asistanıdır.

> Bu repoda, MVP'nin _ilk kullanıcılarla denenebilecek_ canlı versiyonu yer alır. Veriler şu an tarayıcı tarafında (localStorage) saklanır; gerçek auth, dosya yükleme ve bulut sync sonraki fazda eklenecektir.

---

## Kullanılan teknolojiler

- **Next.js 14** (App Router) + **React 18**
- **TypeScript** (strict)
- **Tailwind CSS** — özel marka renk paleti
- **lucide-react** — ikonlar
- **clsx + tailwind-merge** — koşullu className birleştirme
- **PWA**: web manifest + apple-touch-icon (Home Screen'e eklenebilir)
- **State**: React Context + reducer benzeri action'lar, **localStorage** persist

Bağımlılıklar minimum tutulmuştur — UI primitive'leri (button, card, badge, input, label, select, textarea) sıfır kütüphane ile, shadcn benzeri kendi component'lerimiz olarak yazılmıştır.

---

## Hızlı başlangıç

```bash
npm install
npm run dev
# → http://localhost:3000
```

> **npm cache izin sorunu** alırsan: `npm install --cache /tmp/npm-cache-aldim`

İlk açılışta 4 demo ürünle gelir. Eklediğin/sildiğin ürünler localStorage'da kalır; **Ayarlar → Demo verisine sıfırla** ile her zaman geri dönebilirsin.

---

## Production build

```bash
npm run build      # tip kontrol + lint + statik üretim
npm run start      # production server (varsayılan 3000 portu)
```

Build sonrası tüm rotalar statik (`○`) veya dinamik (`ƒ`) olarak prerender edilir; ek bir sunucu ya da DB gerekmez.

---

## Vercel deploy

1. Bu repo'yu GitHub'a push et.
2. [vercel.com/new](https://vercel.com/new) → "Import Git Repository" ile repo'yu seç.
3. **Framework: Next.js** otomatik seçilir; ek konfig gerekmez.
4. **Environment Variables**: MVP için boş bırakabilirsin. Sonraki faz için `.env.example` dosyasını referans al.
5. "Deploy" — birkaç dakika içinde `https://<proje>.vercel.app` linkini alırsın.

> Vercel Edge / Serverless çağrılarında zaman dilimi **UTC**'dir. Aldım tüm tarih hesaplarını client'ta (`lib/date-utils.ts`) lokal-safe biçimde yapar; SSR sırasında tarih bağımlı içerikler hidrate olana kadar skeleton gösterilir, böylece hidrasyon mismatch oluşmaz.

---

## MVP kapsamı

- ✅ Landing page (hero, problem, özellikler, akış, güven, CTA)
- ✅ Dashboard — özet metrikler, acil uyarılar, riske göre sıralı ürün listesi
- ✅ Ürün CRUD — ekle, listele, ara, filtrele, detay, sil, not düzenle
- ✅ Ürün detayı — "Şimdi ne yapmalıyım?" banner, garanti/iade/servis özetleri
- ✅ Belge kasası — tip filtresi + arama
- ✅ İade süreçleri — yaklaşan / devam eden / tamamlanan
- ✅ Servis kayıtları — durum + sonraki takip tarihi
- ✅ Hazır iade mesajı — kopyala butonu
- ✅ Ayarlar — uyarı eşikleri, JSON dışa aktar, demo verisine sıfırla
- ✅ Mobil bottom navigation + iOS safe-area
- ✅ Toast bildirimleri (ekle / sil / kopyala / kaydet)
- ✅ PWA — manifest + apple-touch-icon, Home Screen'e eklenebilir

## Şu an mock/demo olan özellikler

| Alan | Durum | Not |
|---|---|---|
| Dosya yükleme (fatura, garanti, servis formu) | Mock | UI hazır; "Demo" rozetiyle işaretli. Belge adı + tipi kaydedilir. |
| Authentication | Yok | Tek "demo kullanıcı". Veri tarayıcıda. |
| Bulut sync | Yok | LocalStorage. Tarayıcı temizlenirse demo'ya geri döner. |
| Push / e-posta bildirimleri | Yok | Uyarılar yalnızca dashboard'da görseldir. |
| Banka / e-Devlet / kargo API'leri | Yok | Belirtilmiş alanlar serbest metin. |
| Karanlık tema | Placeholder | Ayarlar ekranında disabled. |

## Sonraki faz önerileri

1. **Supabase auth + cloud sync** — `lib/store.tsx` action'larını Supabase'e bağla; localStorage offline cache olarak kalsın.
2. **Gerçek dosya yükleme** — Supabase Storage veya Cloudflare R2. Mevcut belge formu kalır, yalnızca `addDocument` action'ı dosya upload adımı kazanır.
3. **E-posta hatırlatma** — Resend + Vercel Cron, "garanti / iade süresi yaklaşıyor" uyarıları.
4. **OCR ile fatura tarama** — Mistral OCR / Google Document AI ile fotoğraftan ürün adı, tarih, fiyat çıkarımı.
5. **Pazaryeri webhook'ları** — Trendyol / Hepsiburada siparişlerinin otomatik ürün olarak eklenmesi.
6. **Aile / paylaşılan arşiv** — `ownerId` + paylaşım grupları.
7. **Karanlık tema** — `class="dark"` ve Tailwind dark variant'ları.

---

## Proje yapısı

```
aldim/
├── app/
│   ├── layout.tsx, page.tsx (landing), globals.css, manifest.ts
│   └── app/
│       ├── layout.tsx (ToastProvider + AldimStoreProvider + AppShell)
│       ├── page.tsx (dashboard)
│       ├── products/ (page, new, [id])
│       ├── documents/page.tsx
│       ├── returns/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── ui/ (button, card, badge, input, label, select, textarea)
│   ├── app-shell.tsx (sidebar + mobil topbar + bottom nav)
│   └── product-card, stat-card, empty-state, status-badge, alert-banner, ...
├── lib/
│   ├── types.ts            # TS interfaces
│   ├── mock-data.ts        # ilk demo ürünleri + öneri listeleri
│   ├── store.tsx           # Context + localStorage + sanitize
│   ├── toast.tsx           # Toast Context + Toaster
│   ├── date-utils.ts       # local-safe tarih hesapları
│   ├── status.ts           # durum/risk/ton hesapları + labels
│   ├── templates.ts        # satıcı mesajı + yasal uyarı
│   └── utils.ts            # cn, format helper'ları
└── public/
    ├── manifest.webmanifest (Next manifest.ts'ten üretilir)
    ├── favicon.svg, apple-touch-icon.svg, icon-192.svg, icon-512.svg
```

---

## Yasal not

Aldım hukuki danışmanlık vermez. Belgelerini düzenlemene, tarihleri takip etmene ve süreçlerini kayıt altında tutmana yardımcı olur.
