import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  ShieldCheck,
  Bell,
  CreditCard,
  Smartphone,
  Camera,
  Download,
} from "lucide-react";
export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Link className="wordmark" href="/">
          aldım<span>•</span>
        </Link>
        <div>
          <a href="#nasil">Nasıl çalışır?</a>
          <Link className="secondary" href="/app">
            Giriş yap
          </Link>
          <Link className="primary" href="/app">
            Hemen başla <ArrowRight size={17} />
          </Link>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="green-dot" /> ALDIKTAN SONRA DA YANINDA
          </div>
          <h1>
            Aldın.
            <br />
            Gerisini <span>rahat bırak.</span>
          </h1>
          <p>
            Faturaların çekmecede kaybolmasın, garantin aklından çıkmasın.
            Harcamalarını, belgelerini ve önemli tarihlerini tek yerde tut.
          </p>
          <div className="hero-actions">
            <Link className="primary large" href="/app">
              Düzenlemeye başla <ArrowRight size={19} />
            </Link>
            <a href="#nasil">
              Nasıl çalışır? <ArrowRight size={17} />
            </a>
          </div>
          <div className="hero-proof">
            <span>
              <Check size={16} /> Web, iOS ve Android
            </span>
            <span>
              <Check size={16} /> Sana özel belge kasası
            </span>
          </div>
        </div>
        <div
          className="hero-preview"
          aria-label="Aldım örnek uygulama görünümü"
        >
          <div className="preview-top">
            <span className="wordmark">
              aldım<span>•</span>
            </span>
            <span className="pill neutral">Örnek görünüm</span>
          </div>
          <h2>Her şey kontrol altında.</h2>
          <p className="muted">Bugün biraz daha rahat olabilirsin.</p>
          <div className="preview-stats">
            <div>
              <small>Bu ayki harcaman</small>
              <strong>8.450,00 ₺</strong>
            </div>
            <div>
              <small>Güvendeki belgelerin</small>
              <strong>
                12 <span>belge</span>
              </strong>
            </div>
          </div>
          <div className="preview-label">YAKLAŞAN TARİHLER</div>
          <div className="preview-row">
            <div className="item-icon">
              <CreditCard size={23} />
            </div>
            <div>
              <strong>İnternet faturası</strong>
              <span>Son ödeme tarihi</span>
            </div>
            <span className="pill warning">3 gün kaldı</span>
          </div>
          <div className="preview-row">
            <div className="item-icon">
              <ShieldCheck size={23} />
            </div>
            <div>
              <strong>Kahve makinesi</strong>
              <span>Garanti bitiş tarihi</span>
            </div>
            <span className="pill neutral">30 gün kaldı</span>
          </div>
          <div className="floating-receipt">
            <div className="success-icon">
              <Check size={19} />
            </div>
            <div>
              <strong>Faturan güvenle saklandı.</strong>
              <span>İstediğin zaman yanında.</span>
            </div>
          </div>
        </div>
      </section>
      <div className="benefit-strip">
        <span>
          <FileText size={20} /> Kaybolmayan faturalar
        </span>
        <span>
          <ShieldCheck size={20} /> Takip edilen garantiler
        </span>
        <span>
          <Bell size={20} /> Zamanında hatırlatmalar
        </span>
        <span>
          <CreditCard size={20} /> Görünür harcamalar
        </span>
      </div>
      <section className="how-section" id="nasil">
        <div className="eyebrow">DAHA PRATİK BİR GÜNLÜK HAYAT</div>
        <h2>
          Üç küçük adım.
          <br />
          Bir büyük rahatlık.
        </h2>
        <div className="how-grid">
          {[
            {
              icon: Smartphone,
              title: "Aldığını ekle.",
              text: "Yeni telefonun, elektrik faturan veya aylık aboneliğin. Hepsi için bir yer var.",
            },
            {
              icon: Camera,
              title: "Belgeni sakla.",
              text: "Faturanın fotoğrafını çek ya da PDF yükle. Garanti ve servis belgelerini kaydına ekle.",
            },
            {
              icon: Bell,
              title: "Zamanında hatırla.",
              text: "Garanti bitişi, ödeme günü ve servis takibi. Tercihlerine göre bildirim, e-posta veya SMS ile hatırla.",
            },
          ].map((x, i) => (
            <div key={x.title} className="how-card">
              <div className="how-number">0{i + 1}</div>
              <x.icon size={28} />
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="landing-cta">
        <ShieldCheck size={35} />
        <h2>
          Belgelerin yanında.
          <br />
          Aklın başka yerde.
        </h2>
        <p>İlk kaydını ekle, düzenlemeye bugün başla.</p>
        <Link className="primary large" href="/app">
          Aldım’ı kullanmaya başla <ArrowRight size={19} />
        </Link>
      </section>
      <footer className="landing-footer">
        <Link className="wordmark" href="/">
          aldım<span>•</span>
        </Link>
        <span>Faturan, garantin, hatırlatman. Tek bir yerde.</span>
        <Link href="/app">
          Hesabıma git <ArrowRight size={16} />
        </Link>
      </footer>
    </div>
  );
}
