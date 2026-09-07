import { importPreviousMobileData } from "./legacy-import";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, Alert } from "react-native";
import { File } from "expo-file-system";
import {
  createAldimApi,
  EMPTY_SNAPSHOT,
  type Snapshot,
} from "../../shared/api";
import { DEFAULT_SETTINGS } from "../../shared/domain";
import type {
  AldimItem,
  AldimDocument,
  AppSettings,
  ItemCategory,
  ItemFieldValue,
  ServiceRecord,
} from "./types";
import { useAuth } from "./auth";
import { supabase } from "./supabase";
import { uid } from "./utils";
import {
  cancelAllScheduledNotifications,
  getNotificationPermissionStatus,
  scheduleBatch,
  registerPushDevice,
} from "./notifications";
const api = supabase ? createAldimApi(supabase) : null;
export type SyncStatus =
  | "idle"
  | "syncing"
  | "synced"
  | "error"
  | "offline"
  | "supabase_not_configured";
export interface NewItemInput {
  category: ItemCategory;
  title: string;
  brand?: string;
  model?: string;
  store?: string;
  price?: number;
  purchaseDate?: string;
  notes?: string;
  fields: Record<string, ItemFieldValue>;
}
interface Store extends Snapshot {
  hydrated: boolean;
  syncStatus: SyncStatus;
  syncError?: string;
  lastSyncedAt?: string;
  addItem: (input: NewItemInput) => Promise<AldimItem>;
  updateItem: (
    id: string,
    patch: Partial<AldimItem>,
  ) => Promise<
    | { ok: false; reason: "notFound" }
    | {
        ok: true;
        reminderCount: number;
        notificationsScheduled: number;
        permissionGranted: boolean;
      }
  >;
  deleteItem: (id: string) => Promise<void>;
  addDocumentToItem: (
    itemId: string,
    doc: Pick<AldimDocument, "type" | "date" | "fileUri"> & { name?: string },
  ) => Promise<AldimDocument | null>;
  removeDocument: (id: string) => Promise<void>;
  getDocumentById: (id: string) => AldimDocument | undefined;
  addServiceRecord: (
    id: string,
    record: Omit<ServiceRecord, "id" | "itemId">,
  ) => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  completeOnboarding: () => void;
  resetAll: () => Promise<void>;
  syncNow: () => Promise<void>;
  pullFromCloud: () => Promise<void>;
  pushToCloud: () => Promise<void>;
  completeReminder: (id: string) => Promise<void>;
  rescheduleAllNotifications: () => Promise<{
    ok: boolean;
    reason?: "permission";
    processed: number;
    scheduled: number;
    skipped: number;
  }>;
}
const Context = createContext<Store | null>(null);
export function AldimStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const owner = user?.id;
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY_SNAPSHOT);
  const snapshotRef = useRef(snapshot);
  const [hydrated, setHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncError, setSyncError] = useState<string>();
  const [lastSyncedAt, setLastSyncedAt] = useState<string>();
  const active = useRef(true);
  const generation = useRef(0);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      generation.current++;
    };
  }, []);
  const apply = useCallback((next: Snapshot) => {
    if (!active.current) return;
    snapshotRef.current = next;
    setSnapshot(next);
  }, []);
  const refresh = useCallback(async () => {
    if (!api || !owner) return;
    const request = ++generation.current;
    setSyncStatus("syncing");
    setSyncError(undefined);
    try {
      await importPreviousMobileData(owner);
      const next = await api.load(owner);
      if (!active.current || request !== generation.current) return;
      apply(next);
      setSyncStatus("synced");
      setLastSyncedAt(new Date().toISOString());
      await AsyncStorage.setItem(
        `aldim:user:${owner}:state:v3`,
        JSON.stringify(next),
      );
    } catch (e) {
      if (active.current) {
        setSyncStatus("error");
        setSyncError((e as Error).message);
      }
    } finally {
      if (active.current) setHydrated(true);
    }
  }, [owner, apply]);
  useEffect(() => {
    if (!owner) {
      setHydrated(true);
      return;
    }
    let cancelled = false;
    void (async () => {
      const raw = await AsyncStorage.getItem(`aldim:user:${owner}:state:v3`);
      if (raw && !cancelled) {
        try {
          const cached = JSON.parse(raw);
          if (
            Array.isArray(cached.items) &&
            cached.items.every((i: AldimItem) => i.userId === owner)
          )
            apply({ ...EMPTY_SNAPSHOT, ...cached });
        } catch {
          /* preserve original cache */
        }
      }
      if (!cancelled) await refresh();
    })();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [owner, apply, refresh]);
  // One serialized schedule per snapshot. Never persist platform notification IDs to cloud.
  const scheduling = useRef(Promise.resolve());
  const schedule = useCallback(async () => {
    let total = 0,
      skipped = 0;
    const data = snapshotRef.current;
    await cancelAllScheduledNotifications();
    if (
      !data.settings.notificationsEnabled ||
      (await getNotificationPermissionStatus()) !== "granted"
    )
      return {
        ok: false,
        reason: "permission" as const,
        processed: 0,
        scheduled: 0,
        skipped: 0,
      };
    if (owner && (await registerPushDevice(owner)))
      return {
        ok: true,
        processed: data.reminders.length,
        scheduled: 0,
        skipped: 0,
      };
    // iOS holds a bounded queue. Earliest dates get priority; refresh rebuilds on foreground.
    const pending = data.reminders
      .filter((r) => r.status !== "completed")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    for (const r of pending) {
      if (total >= 60) {
        skipped++;
        continue;
      }
      const ids = await scheduleBatch({
        dueDate: r.dueDate,
        beforeDays: r.notifyBeforeDays.slice(0, 60 - total),
        title: r.title,
        body: (days) =>
          days === 0
            ? `${r.itemTitle} için son gün bugün.`
            : `${r.itemTitle}: ${days} gün kaldı.`,
        data: { itemId: r.itemId },
      });
      total += ids.length;
    }
    return { ok: true, processed: pending.length, scheduled: total, skipped };
  }, [owner]);
  useEffect(() => {
    if (!hydrated) return;
    scheduling.current = scheduling.current
      .then(async () => {
        if (active.current) await schedule();
      })
      .catch(() => {});
  }, [
    snapshot.reminders,
    snapshot.settings.notificationsEnabled,
    hydrated,
    schedule,
  ]);
  const mutate = async (operation: () => Promise<unknown>) => {
    if (!api || !owner) throw new Error("Lütfen giriş yap.");
    setSyncStatus("syncing");
    try {
      await operation();
      await refresh();
    } catch (e) {
      setSyncStatus("error");
      setSyncError((e as Error).message);
      throw e;
    }
  };
  const updateItem: Store["updateItem"] = async (id, patch) => {
    const current = snapshotRef.current.items.find((i) => i.id === id);
    if (!current) return { ok: false, reason: "notFound" };
    await mutate(() =>
      api!.saveItem(
        {
          ...current,
          ...patch,
          id: current.id,
          userId: current.userId,
          updatedAt: current.updatedAt,
          fields: patch.fields ?? current.fields,
        },
        snapshotRef.current.reminders,
        uid,
      ),
    );
    return {
      ok: true,
      reminderCount: snapshotRef.current.reminders.filter(
        (r) => r.itemId === id,
      ).length,
      notificationsScheduled: 0,
      permissionGranted:
        (await getNotificationPermissionStatus()) === "granted",
    };
  };
  const updateSettings: Store["updateSettings"] = async (patch) => {
    const next = { ...snapshotRef.current.settings, ...patch };
    if (!owner) {
      apply({ ...snapshotRef.current, settings: next });
      return;
    }
    await mutate(() => api!.saveSettings(next, owner));
  };
  return (
    <Context.Provider
      value={{
        ...snapshot,
        hydrated,
        syncStatus,
        syncError,
        lastSyncedAt,
        addItem: async (input) => {
          const now = new Date().toISOString();
          const item: AldimItem = {
            ...input,
            id: uid(),
            userId: owner!,
            status: "active",
            documents: [],
            serviceRecords: [],
            createdAt: now,
            updatedAt: now,
          };
          await mutate(() =>
            api!.saveItem(item, snapshotRef.current.reminders, uid),
          );
          return (
            snapshotRef.current.items.find((i) => i.id === item.id) ?? item
          );
        },
        updateItem,
        deleteItem: (id) => mutate(() => api!.deleteItem(id)),
        addDocumentToItem: async (itemId, doc) => {
          const item = snapshotRef.current.items.find((i) => i.id === itemId);
          if (!item || !doc.fileUri) return null;
          const file = new File(doc.fileUri);
          const bytes = await file.bytes();
          const ext = doc.fileUri.split("?")[0].split(".").pop()?.toLowerCase();
          const mime =
            ext === "pdf"
              ? "application/pdf"
              : ext === "png"
                ? "image/png"
                : ext === "webp"
                  ? "image/webp"
                  : "image/jpeg";
          const now = new Date().toISOString();
          const record: AldimDocument = {
            id: uid(),
            userId: owner!,
            itemId,
            itemTitle: item.title,
            itemCategory: item.category,
            type: doc.type,
            date: doc.date,
            name:
              doc.name ??
              `${doc.type === "warranty" ? "Garanti" : "Belge"} - ${item.title}`,
            createdAt: now,
            updatedAt: now,
          };
          let saved: AldimDocument | null = null;
          await mutate(async () => {
            saved = await api!.upload(record, bytes, mime);
          });
          return saved;
        },
        removeDocument: async (id) => {
          const doc = snapshotRef.current.items
            .flatMap((i) => i.documents)
            .find((d) => d.id === id);
          if (doc) await mutate(() => api!.deleteDocument(doc));
        },
        getDocumentById: (id) =>
          snapshot.items.flatMap((i) => i.documents).find((d) => d.id === id),
        addServiceRecord: async (id, record) => {
          const item = snapshotRef.current.items.find((i) => i.id === id);
          if (item)
            await updateItem(id, {
              serviceRecords: [
                ...item.serviceRecords,
                { ...record, id: uid(), itemId: id },
              ],
            });
        },
        updateSettings,
        completeOnboarding: () => {
          void updateSettings({ onboardingComplete: true }).catch((e) =>
            Alert.alert("Kaydedilemedi", e.message),
          );
        },
        resetAll: async () => {
          if (owner)
            await AsyncStorage.removeItem(`aldim:user:${owner}:state:v3`);
          apply(EMPTY_SNAPSHOT);
          await refresh();
        },
        syncNow: refresh,
        pullFromCloud: refresh,
        pushToCloud: refresh,
        completeReminder: (id) => mutate(() => api!.completeReminder(id)),
        rescheduleAllNotifications: schedule,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAldimStore() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Store provider missing");
  return ctx;
}
