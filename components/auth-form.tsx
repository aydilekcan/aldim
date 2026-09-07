"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
export function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!supabase) {
      setError("Bağlantı hazırlanıyor. Lütfen daha sonra tekrar dene.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email")).trim();
    const password = String(data.get("password") ?? "");
    setBusy(true);
    try {
      const result =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : mode === "signup"
            ? await supabase.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: `${location.origin}/app` },
              })
            : await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${location.origin}/auth/reset`,
              });
      if (result.error) throw result.error;
      if (mode === "signup")
        setMessage(
          "Hesabını doğrulamak için e-postana gönderilen bağlantıyı aç.",
        );
      if (mode === "reset")
        setMessage(
          "Hesap varsa şifre yenileme bağlantısı e-postana gönderildi.",
        );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setError(
        msg.includes("Invalid login")
          ? "E-posta veya şifre yanlış."
          : msg.includes("Email not confirmed")
            ? "Önce e-postanı doğrula."
            : msg.includes("rate limit")
              ? "Çok fazla deneme yapıldı. Biraz sonra tekrar dene."
              : msg || "İşlem tamamlanamadı.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <Link className="wordmark" href="/">
        aldım<span>•</span>
      </Link>
      <div className="auth-card">
        <div className="eyebrow">DAHA AZ TAKİP, DAHA ÇOK RAHATLIK</div>
        <h1>
          {mode === "login"
            ? "Tekrar hoş geldin."
            : mode === "signup"
              ? "Her şey yerli yerinde."
              : "Şifreni yenile."}
        </h1>
        <p className="muted">
          Faturaların, garantilerin ve ödemelerin her cihazında seninle.
        </p>
        <form onSubmit={submit}>
          <label>
            E-posta
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="sen@ornek.com"
            />
          </label>
          {mode !== "reset" && (
            <label>
              Şifre
              <input
                name="password"
                type="password"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                minLength={mode === "signup" ? 8 : 6}
                required
                placeholder="Şifreni yaz"
              />
            </label>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="success" role="status">
              {message}
            </p>
          )}
          <button className="primary" disabled={busy}>
            {busy
              ? "Biraz bekle…"
              : mode === "login"
                ? "Giriş yap"
                : mode === "signup"
                  ? "Hesap oluştur"
                  : "Yenileme bağlantısı gönder"}
            <ArrowRight size={18} />
          </button>
        </form>
        <div className="auth-links">
          <button
            onClick={() => {
              setMode(mode === "signup" ? "login" : "signup");
              setMessage("");
              setError("");
            }}
          >
            {mode === "signup" ? "Zaten hesabım var" : "Hesap oluştur"}
          </button>
          <button
            onClick={() => {
              setMode(mode === "reset" ? "login" : "reset");
              setMessage("");
              setError("");
            }}
          >
            {mode === "reset" ? "Girişe dön" : "Şifremi unuttum"}
          </button>
        </div>
        <div className="privacy-note">
          <ShieldCheck size={17} /> Belgelerine yalnızca sen erişebilirsin.
        </div>
      </div>
    </div>
  );
}
