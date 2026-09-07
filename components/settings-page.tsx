"use client";
import { useState } from "react";
import { Bell, Download, LogOut, Mail, Smartphone, Check } from "lucide-react";
import { useAldimStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { PageHeading } from "./workspace";
export function SettingsPage() {
  const store = useAldimStore();
  const [settings, setSettings] = useState(store.settings);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await store.saveSettings(settings);
      setMessage("Tercihlerin kaydedildi.");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function exportData() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            version: 3,
            exportedAt: new Date().toISOString(),
            items: store.items,
            reminders: store.reminders,
            payments: store.payments,
            settings: store.settings,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aldim-kayitlarim.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <PageHeading
        eyebrow="SANA GÖRE"
        title="Ayarlar"
        description="Nasıl hatırlatılacağını seç, verilerini yönet."
      />
      <div className="settings-grid">
        <form className="panel detail-panel" onSubmit={save}>
          <h2>Hatırlatma tercihlerin</h2>
          <p className="muted">
            Mobil uygulamada bildirim izni verdiğinde hatırlatmalar telefonuna
            gelir. E-posta ve SMS tercihlerini buradan yönetebilirsin.
          </p>
          {[
            {
              key: "notificationsEnabled",
              label: "Telefon bildirimleri",
              description: "iOS ve Android uygulamasında bildirim al.",
              icon: Bell,
            },
            {
              key: "emailEnabled",
              label: "E-posta hatırlatmaları",
              description:
                "Mobil bildirim kullanmadığında e-posta ile hatırlat.",
              icon: Mail,
            },
            {
              key: "smsEnabled",
              label: "SMS hatırlatmaları",
              description:
                "Mobil bildirim kullanmadığında telefonuna SMS gönder.",
              icon: Smartphone,
            },
          ].map(({ key, label, description, icon: Icon }) => (
            <label className="preference" key={key}>
              <Icon size={21} />
              <span>
                <strong>{label}</strong>
                <small>{description}</small>
              </span>
              <input
                type="checkbox"
                checked={Boolean(settings[key as keyof typeof settings])}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, [key]: e.target.checked }))
                }
              />
            </label>
          ))}
          {settings.smsEnabled && (
            <label>
              Telefon numarası
              <input
                type="tel"
                placeholder="+905xxxxxxxxx"
                value={settings.phone ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    phone: e.target.value.replace(/\s/g, ""),
                  }))
                }
              />
            </label>
          )}
          <p className="muted small-copy">
            E-posta:{" "}
            {store.channels.email
              ? "Etkin"
              : "Gönderim hizmeti kurulumu bekleniyor"}{" "}
            · SMS:{" "}
            {store.channels.sms
              ? "Etkin"
              : "Gönderim hizmeti kurulumu bekleniyor"}
          </p>
          <p className="muted small-copy">
            Hatırlatmalar Türkiye saatiyle 10.00 civarında gönderilir. SMS ve
            e-posta teslimi, ilgili gönderim hizmetinin etkin olmasına bağlıdır.
          </p>
          {message && (
            <p className="success" role="status">
              {message}
            </p>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="primary" disabled={store.busy}>
            <Check size={18} /> Tercihleri kaydet
          </button>
        </form>
        <div>
          <section className="panel detail-panel">
            <h2>Hesabın</h2>
            <p className="muted">{store.user?.email}</p>
            <button
              className="secondary"
              onClick={async () => {
                const r = await supabase?.auth.signOut();
                if (r?.error) setError(r.error.message);
              }}
            >
              <LogOut size={17} /> Çıkış yap
            </button>
          </section>
          <section className="panel detail-panel">
            <h2>Verilerin senin.</h2>
            <button
              className="text-button"
              onClick={async () => {
                setError("");
                try {
                  const raw = localStorage.getItem("aldim:state:v1");
                  if (!raw) {
                    setMessage("Bu tarayıcıda eski kayıt bulunamadı.");
                    return;
                  }
                  await store.importLegacy(JSON.parse(raw));
                  setMessage(
                    "Eski kayıtların aktarıldı. Özgün tarayıcı yedeğin korundu.",
                  );
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Bu tarayıcıdaki eski kayıtları içe aktar
            </button>
            <p className="muted">
              Kayıtlarını, servis ve ödeme geçmişini JSON olarak dışa
              aktarabilirsin. Belgelerin PDF kopyasını belge kasasından
              indirebilirsin.
            </p>
            <button className="secondary" onClick={exportData}>
              <Download size={17} /> Verilerimi dışa aktar
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
