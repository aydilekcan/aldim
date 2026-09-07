import { readWithSessionRetry } from "./retry";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildReminders,
  DEFAULT_SETTINGS,
  validateItem,
  type Payment,
} from "./domain";
import {
  rowToItem,
  rowToDocument,
  rowToReminder,
  rowToSettings,
  settingsToRow,
  itemToRow,
  reminderToRow,
  documentToRow,
} from "./mappers";
import type { AldimItem, AldimDocument, Reminder, AppSettings } from "./types";

export interface Snapshot {
  items: AldimItem[];
  reminders: Reminder[];
  settings: AppSettings;
  payments: Payment[];
  channels: { push: boolean; email: boolean; sms: boolean };
}
export const EMPTY_SNAPSHOT: Snapshot = {
  items: [],
  reminders: [],
  settings: DEFAULT_SETTINGS,
  payments: [],
  channels: { push: true, email: false, sms: false },
};
function check(error: { message: string } | null) {
  if (error)
    throw new Error(
      error.message.includes("JWT issued at future")
        ? "Oturum henüz doğrulanamadı. Birkaç saniye sonra yeniden dene."
        : error.message,
    );
}
export function createAldimApi(client: SupabaseClient) {
  return {
    async load(userId: string): Promise<Snapshot> {
      const results = await readWithSessionRetry(() =>
        Promise.all([
          client
            .from("items")
            .select("*")
            .eq("user_id", userId)
            .is("deleted_at", null)
            .order("updated_at", { ascending: false }),
          client
            .from("documents")
            .select("*")
            .eq("user_id", userId)
            .is("deleted_at", null),
          client
            .from("reminders")
            .select("*")
            .eq("user_id", userId)
            .is("deleted_at", null),
          client
            .from("settings")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle(),
          client
            .from("payments")
            .select("*")
            .eq("user_id", userId)
            .order("paid_at", { ascending: false }),
          client
            .from("notification_channels")
            .select("push,email,sms")
            .eq("id", true)
            .single(),
        ]),
      );
      results.forEach((r) => check(r.error));
      const items: AldimItem[] = (results[0].data ?? []).map(rowToItem);
      const docs: AldimDocument[] = (results[1].data ?? []).map(rowToDocument);
      return {
        channels: results[5].data ?? EMPTY_SNAPSHOT.channels,
        items: items.map((i) => ({
          ...i,
          documents: docs.filter((d) => d.itemId === i.id),
        })),
        reminders: (results[2].data ?? [])
          .map(rowToReminder)
          .filter((r: Reminder) => items.some((i) => i.id === r.itemId)),
        settings: results[3].data
          ? rowToSettings(results[3].data)
          : DEFAULT_SETTINGS,
        payments: (results[4].data ?? []).map((p: Record<string, unknown>) => ({
          id: String(p.id),
          itemId: String(p.item_id),
          itemTitle: String(p.item_title),
          amount: Number(p.amount),
          paidAt: String(p.paid_at),
          dueDate: String(p.due_date),
        })),
      };
    },
    async importItems(items: AldimItem[], uuid?: () => string) {
      let count = 0;
      for (const item of items) {
        const existing = await client
          .from("items")
          .select("id,deleted_at")
          .eq("id", item.id)
          .maybeSingle();
        check(existing.error);
        if (!existing.data) {
          await this.saveItem(item, [], uuid);
          count++;
        }
        if (existing.data?.deleted_at) continue;
        for (const doc of item.documents) {
          const found = await client
            .from("documents")
            .select("id")
            .eq("id", doc.id)
            .maybeSingle();
          check(found.error);
          if (!found.data) {
            const { error } = await client
              .from("documents")
              .insert(documentToRow(doc));
            check(error);
          }
        }
      }
      return count;
    },
    async saveItem(
      item: AldimItem,
      reminders: Reminder[],
      uuid?: () => string,
    ) {
      validateItem(item);
      const generated = buildReminders(item, reminders, uuid);
      const { error } = await client.rpc("save_aldim_item", {
        item_data: itemToRow(item),
        reminder_data: generated.map(reminderToRow),
        expected_updated_at: item.updatedAt,
      });
      check(error);
    },
    async deleteItem(id: string) {
      const { error } = await client.rpc("delete_aldim_item", {
        target_id: id,
      });
      check(error);
    },
    async saveSettings(settings: AppSettings, userId: string) {
      if (
        settings.smsEnabled &&
        !/^\+[1-9]\d{7,14}$/.test(settings.phone ?? "")
      )
        throw new Error("Telefonunu +905xxxxxxxxx biçiminde gir.");
      const { error } = await client
        .from("settings")
        .upsert({
          ...settingsToRow(settings, userId),
          updated_at: new Date().toISOString(),
        });
      check(error);
    },
    async upload(
      doc: AldimDocument,
      data: ArrayBuffer | Uint8Array | Blob,
      contentType: string,
    ) {
      const extensions: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "application/pdf": "pdf",
      };
      const ext = extensions[contentType];
      if (!ext) throw new Error("JPG, PNG, WebP veya PDF seç.");
      const size = "size" in data ? data.size : data.byteLength;
      if (size > 6 * 1024 * 1024)
        throw new Error("Dosya en fazla 6 MB olabilir.");
      if (!size) throw new Error("Boş dosya yüklenemez.");
      const path = `${doc.userId}/${doc.itemId}/${doc.id}.${ext}`;
      const upload = await client.storage
        .from("aldim-documents")
        .upload(path, data, { contentType, upsert: false });
      check(upload.error);
      const saved = { ...doc, storagePath: path, fileUri: undefined };
      const { error } = await client
        .from("documents")
        .insert(documentToRow(saved));
      if (error) {
        await client.storage.from("aldim-documents").remove([path]);
        check(error);
      }
      return saved;
    },
    async documentUrl(path: string) {
      const { data, error } = await client.storage
        .from("aldim-documents")
        .createSignedUrl(path, 300);
      check(error);
      if (!data) throw new Error("Belge açılamadı.");
      return data.signedUrl;
    },
    async deleteDocument(doc: AldimDocument) {
      const { error } = await client
        .from("documents")
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", doc.id);
      check(error);
      // Keep the private object for recovery; a separate retention job may purge tombstoned files.
    },
    async completeReminder(id: string) {
      const { error } = await client.rpc("complete_aldim_reminder", {
        target_id: id,
      });
      check(error);
    },
  };
}
