import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  FolderClosed,
  Wrench,
  MessageSquareText,
  Users,
  CalendarClock,
  Receipt,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { LEGAL_DISCLAIMER } from "@/lib/templates";

const features = [
  {
    icon: Receipt,
    title: "Fatura ve belge kasası",
    description:
      "Tüm faturalarını, garanti belgelerini ve servis formlarını tek yerde sakla. Bir daha aramakla uğraşma.",
  },
  {
    icon: ShieldCheck,
    title: "Garanti süresi takibi",
    description:
      "Her ürünün garanti bitiş tarihini gör. Bitmeden önce hatırlatalım, hakkını kullanmayı kaçırma.",
  },
  {
    icon: CalendarClock,
    title: "İade tarihi hatırlatma",
    description:
      "Yasal iade süresi bitmeden uyaralım. Süre yaklaşan ürünleri ön plana çıkaralım.",
  },
  {
    icon: Wrench,
    title: "Servis kaydı arşivi",
    description:
      "Hangi ürün ne zaman servise gitti, hangi şirket, hangi gerekçeyle. Hepsi tek geçmişte.",
  },
  {
    icon: MessageSquareText,
    title: "Hazır iade mesajları",
    description:
      "Satıcıya gönderebileceğin sade, net, hazır iade mesajları. Kopyala, gönder, takibe başla.",
  },
  {
    icon: Users,
    title: "Aile alışveriş arşivi için uygun",
    description:
      "Eş, çocuk, ebeveyn — bir hanedeki tüm alışverişlerin tek bir kayıt altında düzenlenebilsin.",
  },
];

const flow = [
  { step: "1", title: "Ürünü ekle", text: "Marka, fiyat, tarih, garanti süresi — tek formda." },
  { step: "2", title: "Faturanı sakla", text: "Belgeleri kasaya at, gerektiğinde anında bul." },
  { step: "3", title: "Garanti ve iade tarihini takip et", text: "Süre yaklaşınca Aldım sana hatırlatır." },
  { step: "4", title: "Sorun çıkarsa belgelerin hazır olsun", text: "İade mesajı, servis kaydı, kargo bilgisi — hepsi elinin altında." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-ink-50 to-ink-50">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-ink-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandLogo />
          <nav className="hidden md:flex items-center gap-7 text-sm text-ink-600">
            <a href="#features" className="hover:text-ink-900">Özellikler</a>
            <a href="#how" className="hover:text-ink-900">Nasıl çalışır?</a>
            <a href="#trust" className="hover:text-ink-900">Güven</a>
            <Link href="/app" className="hover:text-ink-900">Demo</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/app"
              className="hidden sm:inline-flex items-center text-sm font-medium text-ink-700 hover:text-ink-900 px-3 py-2"
            >
              Giriş
            </Link>
            <Link href="/app">
              <Button size="sm">Hemen dene</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-ink-100 text-xs font-medium text-brand-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Faturan, garantin, iaden tek yerde.
              </div>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-ink-900 leading-[1.05]">
                Aldıkların{" "}
                <span className="text-brand-700">kontrol altında.</span>
              </h1>
              <p className="mt-5 text-lg text-ink-600 max-w-xl">
                Faturanı, garanti süreni, iade hakkını ve servis kayıtlarını
                tek yerde takip et. Aldım, alışverişten sonra da yanında.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/app">
                  <Button size="lg" className="gap-2">
                    Hemen dene
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#how">
                  <Button size="lg" variant="outline">
                    Nasıl çalışır?
                  </Button>
                </a>
              </div>
              <ul className="mt-6 flex flex-wrap gap-4 text-sm text-ink-600">
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-accent-600" />
                  Kart bilgisi istenmez
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-accent-600" />
                  Mobil uyumlu
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-accent-600" />
                  Türkçe
                </li>
              </ul>
            </div>

            {/* Sahte demo dashboard preview */}
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-br from-brand-200/30 via-accent-200/30 to-transparent blur-2xl" />
              <div className="relative rounded-3xl bg-white shadow-pop border border-ink-100 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-ink-500">Bugün</p>
                    <p className="text-sm font-semibold text-ink-900">Aldıkların</p>
                  </div>
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white text-sm font-bold">
                    A
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl bg-ink-50 p-3">
                    <p className="text-xs text-ink-500">Toplam ürün</p>
                    <p className="text-2xl font-semibold text-ink-900 mt-1">12</p>
                  </div>
                  <div className="rounded-xl bg-warn-50 p-3">
                    <p className="text-xs text-warn-600">İade süresi yaklaşan</p>
                    <p className="text-2xl font-semibold text-warn-600 mt-1">2</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl border border-ink-100 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink-900">AirPods Pro</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-warn-50 text-warn-600">
                        3 gün kaldı
                      </span>
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5">Trendyol · 8.999 ₺</p>
                  </div>
                  <div className="rounded-xl border border-ink-100 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink-900">MacBook Air M2</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent-50 text-accent-700">
                        Aktif
                      </span>
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5">Hepsiburada · 42.999 ₺</p>
                  </div>
                  <div className="rounded-xl border border-ink-100 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink-900">Kahve Makinesi</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                        Serviste
                      </span>
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5">MediaMarkt · 6.499 ₺</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="rounded-3xl bg-white border border-ink-100 p-8 sm:p-12 shadow-card">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 max-w-2xl">
            Fatura kaybolur. Garanti unutulur. İade süresi geçer.
          </h2>
          <p className="mt-3 text-lg text-ink-700 max-w-2xl font-medium">
            Aldım bunları tek yerde toplar.
          </p>
          <p className="mt-3 text-ink-600 max-w-2xl">
            Alışverişten sonra yaşanan küçük ama pahalı sorunlar artık parmaklarının
            ucunda. Belgelerini düzenler, tarihlerini hatırlatır ve sorun çıkarsa
            hazır olmana yardımcı olur.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Özellikler</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900">
            Alışveriş sonrası asistanın
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-2xl bg-white border border-ink-100 p-6 shadow-card hover:shadow-pop transition"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-ink-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-ink-600">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Flow */}
      <section id="how" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Nasıl çalışır?</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900">
            Dört adımda kontrol sende
          </h2>
        </div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {flow.map((item) => (
            <li
              key={item.step}
              className="rounded-2xl bg-white border border-ink-100 p-6 shadow-card"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white text-sm font-bold">
                {item.step}
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink-900">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm text-ink-600">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Trust */}
      <section id="trust" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="rounded-3xl bg-brand-900 text-white p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent-500/20 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              Şeffaf ve güvenilir
            </div>
            <h2 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight max-w-2xl">
              Avukat değil. Akıllı belge ve takip asistanı.
            </h2>
            <p className="mt-3 text-white/80 max-w-2xl">
              {LEGAL_DISCLAIMER}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="rounded-3xl border border-ink-100 bg-white p-8 sm:p-12 text-center shadow-card">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900">
            İlk ürününü Aldım’a ekle.
          </h2>
          <p className="mt-3 text-ink-600 max-w-xl mx-auto">
            Demo veriyle hemen denemeye başlayabilirsin. Kayıt gerekmez,
            kart bilgisi istenmez.
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/app">
              <Button size="lg" className="gap-2">
                Demo panele geç
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-100 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <span className="text-xs text-ink-500">© {new Date().getFullYear()} Aldım</span>
          </div>
          <p className="text-xs text-ink-500 max-w-md sm:text-right">
            {LEGAL_DISCLAIMER}
          </p>
        </div>
      </footer>
    </div>
  );
}
