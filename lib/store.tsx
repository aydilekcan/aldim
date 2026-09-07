"use client";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import type { User } from "@supabase/supabase-js";
import { convertLegacy } from "../shared/legacy";
import { supabase } from "./supabase";
import { createAldimApi, EMPTY_SNAPSHOT, type Snapshot } from "../shared/api";
import type { AldimItem, AldimDocument, AppSettings } from "../shared/types";

const api = supabase ? createAldimApi(supabase) : null;
interface Store extends Snapshot {
  user: User | null;
  loading: boolean;
  error: string;
  busy: boolean;
  refresh: () => Promise<void>;
  importLegacy: (raw: unknown) => Promise<void>;
  saveItem: (item: AldimItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  upload: (
    item: AldimItem,
    file: File,
    type: AldimDocument["type"],
  ) => Promise<void>;
  deleteDocument: (doc: AldimDocument) => Promise<void>;
  documentUrl: (path: string) => Promise<string>;
  completeReminder: (id: string) => Promise<void>;
  saveSettings: (settings: AppSettings) => Promise<void>;
}
const Context = createContext<Store | null>(null);
export function AldimStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY_SNAPSHOT);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const owner = useRef<string | null>(null);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const id = owner.current;
    if (!api || !id) return;
    const request = ++generation.current;
    try {
      const data = await api.load(id);
      if (id === owner.current && request === generation.current) {
        setSnapshot(data);
        setError("");
      }
    } catch (e) {
      if (id === owner.current)
        setError(e instanceof Error ? e.message : "Veriler yüklenemedi.");
    } finally {
      if (id === owner.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setError("Bağlantı yapılandırması eksik.");
      return;
    }
    let active = true;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const next = session?.user ?? null;
      if (owner.current !== next?.id) {
        owner.current = next?.id ?? null;
        generation.current++;
        setSnapshot(EMPTY_SNAPSHOT);
      }
      setUser(next);
      setLoading(!!next);
      if (next)
        setTimeout(() => {
          if (active && owner.current === next.id) void refresh();
        }, 0);
      else setLoading(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
      owner.current = null;
    };
  }, [refresh]);
  useEffect(() => {
    const run = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", run);
    window.addEventListener("online", run);
    return () => {
      window.removeEventListener("focus", run);
      window.removeEventListener("online", run);
    };
  }, [refresh]);
  const mutate = async (operation: () => Promise<unknown>) => {
    if (!api || !owner.current) throw new Error("Lütfen giriş yap.");
    setBusy(true);
    try {
      await operation();
      await refresh();
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : "İşlem tamamlanamadı.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Context.Provider
      value={{
        ...snapshot,
        user,
        loading,
        error,
        busy,
        refresh,
        importLegacy: (raw) =>
          mutate(() => api!.importItems(convertLegacy(raw, owner.current!))),
        saveItem: (item) =>
          mutate(() => api!.saveItem(item, snapshot.reminders)),
        deleteItem: (id) => mutate(() => api!.deleteItem(id)),
        completeReminder: (id) => mutate(() => api!.completeReminder(id)),
        saveSettings: (s) => mutate(() => api!.saveSettings(s, owner.current!)),
        deleteDocument: (doc) => mutate(() => api!.deleteDocument(doc)),
        documentUrl: (path) => api!.documentUrl(path),
        upload: (item, file, type) =>
          mutate(() => {
            const now = new Date().toISOString();
            return api!.upload(
              {
                id: crypto.randomUUID(),
                userId: owner.current!,
                itemId: item.id,
                itemTitle: item.title,
                itemCategory: item.category,
                name: file.name,
                type,
                date: now.slice(0, 10),
                createdAt: now,
                updatedAt: now,
              },
              file,
              file.type,
            );
          }),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAldimStore() {
  const value = useContext(Context);
  if (!value) throw new Error("Store provider missing");
  return value;
}
