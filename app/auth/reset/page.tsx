"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
export default function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("password") !== f.get("confirm")) {
      setMessage("Şifreler eşleşmiyor.");
      return;
    }
    setBusy(true);
    const r = await supabase?.auth.updateUser({
      password: String(f.get("password")),
    });
    setMessage(
      r?.error
        ? r.error.message
        : "Şifren güncellendi. Uygulamaya dönebilirsin.",
    );
    setBusy(false);
  }
  return (
    <div className="auth-page">
      <Link className="wordmark" href="/">
        aldım<span>•</span>
      </Link>
      <div className="auth-card">
        <h1>Yeni şifreni belirle.</h1>
        {ready ? (
          <form onSubmit={submit}>
            <label>
              Yeni şifre
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </label>
            <label>
              Şifreyi tekrar yaz
              <input
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </label>
            <button className="primary" disabled={busy}>
              Şifreyi güncelle
            </button>
          </form>
        ) : (
          <p className="muted">
            E-postandaki şifre yenileme bağlantısını kullan.
          </p>
        )}
        {message && <p role="status">{message}</p>}
        <Link className="text-button" href="/app">
          Uygulamaya dön →
        </Link>
      </div>
    </div>
  );
}
