import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { addDaysIso, isoToDateAt } from "./date-utils";

/**
 * Bildirim katmanı — Expo push kaydı ve cihaz içi hatırlatma yedeği.
 *
 * Reminder içerikleri artık `lib/categories.ts` içindeki ReminderSpec'lerden
 * geliyor; buradaki scheduleBatch yalnızca düşük seviye API'yi sağlar.
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type PermissionStatus = "granted" | "denied" | "undetermined";

let permissionPromptedThisSession = false;

export async function getNotificationPermissionStatus(): Promise<PermissionStatus> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "granted") return "granted";
    if (status === "denied") return "denied";
    return "undetermined";
  } catch {
    return "undetermined";
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") {
      await ensureAndroidChannel();
      return true;
    }
    if (existing === "denied" && permissionPromptedThisSession) return false;
    permissionPromptedThisSession = true;
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === "granted") {
      await ensureAndroidChannel();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  try {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Aldım Hatırlatmaları",
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: "#172F5E",
    });
  } catch {
    /* sessiz */
  }
}

async function scheduleAt(opts: {
  dateIso: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<string | null> {
  const fireDate = isoToDateAt(opts.dateIso, 10, 0);
  if (fireDate.getTime() <= Date.now()) return null;
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: opts.title,
        body: opts.body,
        data: opts.data ?? {},
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      },
    });
    return id;
  } catch {
    return null;
  }
}

/**
 * Bir bitiş tarihi + "kaç gün önce" listesi alır, her offset için bir
 * bildirim kurar. Geçmiş tarihler atlanır, duplicate offset koruması var.
 */
export async function scheduleBatch(opts: {
  dueDate?: string | null;
  beforeDays: number[];
  title: string;
  body: (daysLeft: number) => string;
  data?: Record<string, unknown>;
}): Promise<string[]> {
  if (!opts.dueDate) return [];
  const seen = new Set<number>();
  const ids: string[] = [];
  for (const before of opts.beforeDays) {
    if (seen.has(before)) continue;
    seen.add(before);
    const fireIso = addDaysIso(opts.dueDate, -before);
    const id = await scheduleAt({
      dateIso: fireIso,
      title: opts.title,
      body: opts.body(before),
      data: { ...opts.data, daysBefore: before },
    });
    if (id) ids.push(id);
  }
  return ids;
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    /* sessiz */
  }
}

/** Registers this installation for reminders created on any device. */
export async function registerPushDevice(userId: string): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const { supabase } = await import('./supabase');
    if (!supabase) return false;
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const key = `aldim:device:${userId}`;
    let id = await AsyncStorage.getItem(key);
    if (!id) { id = (await import('expo-crypto')).randomUUID(); await AsyncStorage.setItem(key,id); }
    if (await getNotificationPermissionStatus() !== 'granted') {
      await supabase.from('device_tokens').update({ enabled:false }).eq('id',id).eq('user_id',userId);
      return false;
    }
    await ensureAndroidChannel();
    const token = await Notifications.getExpoPushTokenAsync({ projectId: 'f5bfa130-617b-4542-b5be-1b45a6f46ac5' });
    const { error } = await supabase.from('device_tokens').upsert({ id,user_id:userId,token:token.data,platform:Platform.OS,enabled:true,last_seen_at:new Date().toISOString() });
    return !error;
  } catch { return false; }
}
export async function unregisterPushDevice(userId:string):Promise<void> {
 const { supabase } = await import('./supabase');
 const AsyncStorage=(await import('@react-native-async-storage/async-storage')).default;
 const id=await AsyncStorage.getItem(`aldim:device:${userId}`);
 if(supabase&&id){const {error}=await supabase.from('device_tokens').delete().eq('id',id).eq('user_id',userId);if(error)throw error;}
 await cancelAllScheduledNotifications();
}
