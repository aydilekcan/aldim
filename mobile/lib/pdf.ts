import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { supabase } from "./supabase";
import type { AldimDocument } from "./types";
const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export async function shareDocumentPdf(doc: AldimDocument) {
  if (!supabase || !doc.storagePath)
    throw new Error("Belge bulutta bulunamadı.");
  const { data, error } = await supabase.storage
    .from("aldim-documents")
    .createSignedUrl(doc.storagePath, 300);
  if (error || !data) throw new Error("Belge indirilemedi.");
  const target = new File(
    Paths.cache,
    `aldim-${doc.id}.${doc.storagePath.split(".").pop()}`,
  );
  const file = await File.downloadFileAsync(data.signedUrl, target, {
    idempotent: true,
  });
  let uri = file.uri;
  if (!doc.storagePath.toLowerCase().endsWith(".pdf")) {
    const ext = doc.storagePath.split(".").pop();
    const mime =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : "image/jpeg";
    const base64 = await file.base64();
    const result = await Print.printToFileAsync({
      html: `<html><head><meta charset="utf-8"/></head><body style="font-family:Arial;padding:20px"><h2>${escape(doc.name)}</h2><p>${escape(doc.itemTitle)}</p><img style="max-width:100%;max-height:900px;object-fit:contain" src="data:${mime};base64,${base64}"/></body></html>`,
    });
    uri = result.uri;
  }
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("Bu cihazda paylaşım kullanılamıyor.");
  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
    dialogTitle: "PDF olarak kaydet veya paylaş",
  });
}
