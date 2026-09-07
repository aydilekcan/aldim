import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { unregisterPushDevice } from "./notifications";
import { isSupabaseConfigured, supabase } from "./supabase";

/**
 * Auth katmanı
 *
 * Aldım'da herkesin hesabı olmalıdır — misafir kullanım yoktur.
 * Üç durum:
 *  1) `loading: true`                    → uygulama oturum kontrolü yapıyor.
 *  2) `user: null`                       → oturum yok, kullanıcı /auth/welcome'a yönlendirilir.
 *  3) `user: { id, email }`              → giriş yapılmış, ana uygulamaya erişebilir.
 *
 * Supabase yapılandırılmadıysa (`configured: false`) auth ekranı bir
 * developer uyarısı gösterir; kullanıcı yine de giriş/kayıt yapamaz.
 */

export interface AuthUser {
  id: string;
  email?: string;
}

interface AuthApi {
  user: AuthUser | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signUp: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}

const AuthContext = createContext<AuthApi | null>(null);

function translateError(message: string): string {
  if (message.includes("Invalid login")) return "E-posta veya şifre yanlış.";
  if (message.includes("already registered")) return "Bu e-posta zaten kayıtlı.";
  if (message.includes("Password should be at least"))
    return "Şifre en az 6 karakter olmalı.";
  if (message.includes("Email not confirmed"))
    return "E-postanı doğrulaman gerekiyor.";
  return message;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let mounted = true;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? undefined } : null);
      setLoading(false);
    });
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, []);

  const signIn = useCallback<AuthApi["signIn"]>(async (email, password) => {
    if (!supabase) return { ok: false, error: "Giriş sistemi yapılandırılmamış." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: translateError(error.message) };
    return { ok: true };
  }, []);

  const signUp = useCallback<AuthApi["signUp"]>(async (email, password) => {
    if (!supabase) return { ok: false, error: "Giriş sistemi yapılandırılmamış." };
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: "https://aldim.vercel.app/app" } });
    if (error) return { ok: false, error: translateError(error.message) };
    return { ok: true };
  }, []);

  const signOut = useCallback<AuthApi["signOut"]>(async () => {
    if (supabase) { const { data } = await supabase.auth.getUser(); if (data.user) await unregisterPushDevice(data.user.id); const { error } = await supabase.auth.signOut(); if (error) throw error; }
    setUser(null);
  }, []);

  const resetPassword = useCallback<AuthApi["resetPassword"]>(async (email) => {
    if (!supabase) return { ok: false, error: "Giriş sistemi yapılandırılmamış." };
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: "https://aldim.vercel.app/auth/reset" });
    if (error) return { ok: false, error: translateError(error.message) };
    return { ok: true };
  }, []);

  const value = useMemo<AuthApi>(
    () => ({
      user,
      loading,
      configured,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }),
    [user, loading, configured, signIn, signUp, signOut, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
