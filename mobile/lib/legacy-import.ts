import AsyncStorage from "@react-native-async-storage/async-storage";
import { File } from "expo-file-system";
import { convertLegacy } from "../../shared/legacy";
import { createAldimApi } from "../../shared/api";
import { supabase } from "./supabase";
import { uid } from "./utils";
export async function importPreviousMobileData(userId: string) {
  if (!supabase) return;
  const key = `aldim:user:${userId}:state:v2`;
  if (await AsyncStorage.getItem(`${key}:imported-v3`)) return;
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return;
  const items = convertLegacy(JSON.parse(raw), userId);
  const api = createAldimApi(supabase);
  await api.importItems(items, uid);
  for (const item of items)
    for (const doc of item.documents) {
      if (!doc.fileUri || doc.storagePath) continue;
      const file = new File(doc.fileUri);
      if (!file.exists) continue;
      const { data, error } = await supabase
        .from("documents")
        .select("storage_path,deleted_at")
        .eq("id", doc.id)
        .single();
      if (error) throw error;
      if (data.storage_path || data.deleted_at) continue;
      const ext =
        doc.fileUri.split("?")[0].split(".").pop()?.toLowerCase() ?? "jpg";
      const mime =
        ext === "pdf"
          ? "application/pdf"
          : ext === "png"
            ? "image/png"
            : ext === "webp"
              ? "image/webp"
              : "image/jpeg";
      const path = `${userId}/${item.id}/${doc.id}.${ext}`;
      const upload = await supabase.storage
        .from("aldim-documents")
        .upload(path, await file.bytes(), { contentType: mime, upsert: true });
      if (upload.error) throw upload.error;
      const result = await supabase
        .from("documents")
        .update({ storage_path: path, updated_at: new Date().toISOString() })
        .eq("id", doc.id);
      if (result.error) throw result.error;
    }
  // Original state and original files remain available as a recovery copy.
  await AsyncStorage.setItem(`${key}:imported-v3`, new Date().toISOString());
}
