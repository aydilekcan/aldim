import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase istemcisi.
 *
 * - `.env.local`'da `EXPO_PUBLIC_SUPABASE_URL` ve
 *   `EXPO_PUBLIC_SUPABASE_ANON_KEY` varsa gerçek istemci yaratılır.
 * - Yoksa `null` döner — uygulama hiçbir koşulda çökmez.
 *
 * SSR notu: Expo Router'ın web build'i bazı entry'leri Node tarafında
 * pre-render eder. `AsyncStorage` Node ortamında `window`'a baktığı için
 * patlar. Native ortamı dışında storage'ı `undefined` bırakıyoruz —
 * SSR sırasında zaten session olmaz, sorun değil.
 */

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

const isBrowserlike =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";
const isNative =
  typeof navigator !== "undefined" && navigator.product === "ReactNative";

let client: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: isNative || isBrowserlike ? AsyncStorage : undefined,
        autoRefreshToken: isNative || isBrowserlike,
        persistSession: isNative || isBrowserlike,
        detectSessionInUrl: false,
      },
    });
  } catch {
    client = null;
  }
}

export const supabase = client;

export function isSupabaseConfigured(): boolean {
  return client !== null;
}
