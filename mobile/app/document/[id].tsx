import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { useAldimStore } from "../../lib/store";
import { supabase } from "../../lib/supabase";
import { shareDocumentPdf } from "../../lib/pdf";
import { colors, spacing } from "../../lib/theme";
import { formatDateTR } from "../../lib/date-utils";
import { DOCUMENT_LABELS } from "../../../shared/domain";
export default function DocumentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getDocumentById, removeDocument } = useAldimStore();
  const doc = getDocumentById(id);
  const [url, setUrl] = useState<string>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    setUrl(undefined);
    setError("");
    if (doc?.storagePath && supabase)
      void supabase.storage
        .from("aldim-documents")
        .createSignedUrl(doc.storagePath, 300)
        .then(({ data, error }) => {
          if (active) {
            if (error)
              setError("Belge yüklenemedi. İnternet bağlantını kontrol et.");
            else setUrl(data?.signedUrl);
          }
        });
    return () => {
      active = false;
    };
  }, [doc?.storagePath]);
  if (!doc)
    return (
      <View style={{ padding: 24 }}>
        <Text>Belge bulunamadı.</Text>
      </View>
    );
  const pdf = doc.storagePath?.endsWith(".pdf");
  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.lg,
        gap: 16,
        paddingBottom: 40,
      }}
    >
      <Card>
        <Text
          style={{ fontSize: 22, fontWeight: "700", color: colors.ink[900] }}
        >
          {doc.name}
        </Text>
        <Text style={{ marginTop: 9, color: colors.ink[500] }}>
          {DOCUMENT_LABELS[doc.type]} · {formatDateTR(doc.date)}
        </Text>
      </Card>
      {!doc.storagePath ? (
        <Text style={{ color: colors.ink[600] }}>
          Bu eski kayıtta yalnızca belge bilgisi var. Fotoğrafı bağlı kayıttan
          yeniden yükleyebilirsin.
        </Text>
      ) : error ? (
        <Text accessibilityRole="alert" style={{ color: colors.danger[600] }}>
          {error}
        </Text>
      ) : !url ? (
        <ActivityIndicator />
      ) : pdf ? (
        <Button
          title="PDF belgesini görüntüle"
          variant="outline"
          onPress={() =>
            void Linking.openURL(url).catch(() =>
              Alert.alert("Açılamadı", "PDF görüntülenemedi."),
            )
          }
        />
      ) : (
        <Image
          source={{ uri: url }}
          style={{
            width: "100%",
            height: 380,
            borderRadius: 16,
            backgroundColor: colors.white,
          }}
          resizeMode="contain"
          onError={() =>
            setError(
              "Belge görseli açılamadı. PDF olarak indirmeyi deneyebilirsin.",
            )
          }
        />
      )}
      <Button
        title="PDF indir / paylaş"
        disabled={!doc.storagePath}
        loading={busy}
        onPress={async () => {
          setBusy(true);
          try {
            await shareDocumentPdf(doc);
          } catch (e) {
            Alert.alert("İndirilemedi", (e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      />
      <Button
        title="Bağlı kaydı aç"
        variant="outline"
        onPress={() => router.push(`/item/${doc.itemId}`)}
      />
      <Button
        title="Belgeyi sil"
        variant="outline"
        onPress={() =>
          Alert.alert("Belgeyi sil", "Belge kasandan kaldırılacak.", [
            { text: "Vazgeç", style: "cancel" },
            {
              text: "Sil",
              style: "destructive",
              onPress: async () => {
                try {
                  await removeDocument(doc.id);
                  router.back();
                } catch (e) {
                  Alert.alert("Silinemedi", (e as Error).message);
                }
              },
            },
          ])
        }
      />
    </ScrollView>
  );
}
