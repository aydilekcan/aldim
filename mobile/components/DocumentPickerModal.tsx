import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "./Button";
import { CATEGORIES } from "../lib/categories";
import { colors, fontSize, radius, spacing } from "../lib/theme";
import type { DocumentType, ItemCategory } from "../lib/types";

/* ----------------------------------------------------------------------
 * DocumentPickerModal
 *
 * Akış:
 *  1. Üstte kategori-bazlı default belge tipleri chip olarak gösterilir;
 *     ilki seçili gelir, kullanıcı değiştirebilir.
 *  2. İki büyük buton: "Galeriden seç" / "Kamera ile çek".
 *  3. Görsel alındığında modal kapanır, onPick(uri, type) çağrılır.
 *  4. Vazgeç → modal sessiz kapanır (hata göstermez).
 *
 * Bu component sadece UI + izin akışı; gerçek kayıt store'da yapılır.
 * ------------------------------------------------------------------- */

const ALL_TYPES: { value: DocumentType; label: string }[] = [
  { value: "invoice", label: "Fatura" },
  { value: "warranty", label: "Garanti belgesi" },
  { value: "service_form", label: "Servis formu" },
  { value: "policy", label: "Poliçe" },
  { value: "registration", label: "Ruhsat" },
  { value: "inspection", label: "Muayene belgesi" },
  { value: "shipping_receipt", label: "Kargo fişi" },
  { value: "bill", label: "Fatura ödeme" },
  { value: "return_request", label: "İade talebi" },
  { value: "other", label: "Diğer" },
];

function typeLabel(t: DocumentType): string {
  return ALL_TYPES.find((x) => x.value === t)?.label ?? "Belge";
}

export function DocumentPickerModal({
  visible,
  category,
  onClose,
  onPick,
}: {
  visible: boolean;
  category: ItemCategory;
  onClose: () => void;
  onPick: (fileUri: string, type: DocumentType) => void;
}) {
  const spec = CATEGORIES[category];
  const suggestedTypes = spec.defaultDocumentTypes;
  const initialType = suggestedTypes[0] ?? "other";

  const [selectedType, setSelectedType] = useState<DocumentType>(initialType);
  const [busy, setBusy] = useState(false);
  const [showAllTypes, setShowAllTypes] = useState(false);

  // Modal her açıldığında default'a dön
  // (visible prop'u değiştiğinde useState'i resetlemek için key trick)
  // Burada basit tutuyoruz; kullanıcı modal'ı kapatıp tekrar açarsa son seçim korunabilir.

  const handleResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    onPick(asset.uri, selectedType);
    onClose();
  };

  const onGallery = async () => {
    setBusy(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Galeri izni gerekli",
          "Belge görselini eklemek için galeriye erişim izni vermen gerekiyor. Ayarlar'dan açabilirsin.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.75,
      });
      handleResult(result);
    } catch {
      Alert.alert("Hata", "Görsel seçilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const onFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        onPick(result.assets[0].uri, selectedType);
        onClose();
      }
    } catch {
      Alert.alert("Dosya seçilemedi", "Lütfen tekrar dene.");
    }
  };

  const onCamera = async () => {
    setBusy(true);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Kamera izni gerekli",
          "Belge fotoğrafı çekmek için kameraya erişim izni vermen gerekiyor. Ayarlar'dan açabilirsin.",
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.75,
      });
      handleResult(result);
    } catch {
      Alert.alert("Hata", "Kamera açılamadı.");
    } finally {
      setBusy(false);
    }
  };

  const visibleTypes = showAllTypes
    ? ALL_TYPES
    : ALL_TYPES.filter((t) => suggestedTypes.includes(t.value));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Belge ekle</Text>
            <Text style={styles.subtitle}>
              {spec.label} kaydı için fatura, garanti veya diğer belgeleri ekle.
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="close" size={22} color={colors.ink[700]} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionLabel}>Belge tipi</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm, paddingVertical: 4 }}
          >
            {visibleTypes.map((t) => {
              const active = selectedType === t.value;
              return (
                <Pressable
                  key={t.value}
                  onPress={() => setSelectedType(t.value)}
                  style={[
                    styles.chip,
                    active && {
                      backgroundColor: colors.brand[700],
                      borderColor: colors.brand[700],
                    },
                  ]}
                >
                  <Text
                    style={[styles.chipText, active && { color: colors.white }]}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {!showAllTypes && ALL_TYPES.length > visibleTypes.length && (
            <Pressable
              onPress={() => setShowAllTypes(true)}
              style={styles.toggleAll}
            >
              <Text style={styles.toggleText}>
                Diğer belge tiplerini göster
              </Text>
            </Pressable>
          )}

          <View style={styles.preview}>
            <Ionicons
              name="document-attach-outline"
              size={28}
              color={colors.brand[700]}
            />
            <Text style={styles.previewText}>
              Seçilen tip:{" "}
              <Text style={{ fontWeight: "700" }}>
                {typeLabel(selectedType)}
              </Text>
            </Text>
            <Text style={styles.previewHint}>
              Belge eklendikten sonra detay ekranında her zaman
              görüntüleyebilirsin.
            </Text>
          </View>

          <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
            <Button
              title="PDF veya dosya seç"
              onPress={onFile}
              variant="outline"
              fullWidth
            />
            <Button
              title="Galeriden seç"
              onPress={onGallery}
              loading={busy}
              fullWidth
              leftIcon={
                <Ionicons
                  name="images-outline"
                  size={18}
                  color={colors.white}
                />
              }
            />
            <Button
              title="Kamera ile çek"
              variant="outline"
              onPress={onCamera}
              loading={busy}
              fullWidth
              leftIcon={
                <Ionicons
                  name="camera-outline"
                  size={18}
                  color={colors.ink[800]}
                />
              }
            />
          </View>

          {busy && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.brand[700]} />
              <Text style={styles.loadingText}>Görsel alınıyor...</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: colors.ink[50],
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink[100],
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.ink[900],
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.ink[500],
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.ink[100],
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing["3xl"],
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.ink[700],
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.ink[200],
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.ink[700],
  },
  toggleAll: {
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  toggleText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.brand[700],
  },
  preview: {
    alignItems: "center",
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ink[100],
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  previewText: {
    fontSize: fontSize.base,
    color: colors.ink[800],
    textAlign: "center",
  },
  previewHint: {
    fontSize: fontSize.xs,
    color: colors.ink[500],
    textAlign: "center",
    lineHeight: 18,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.ink[500],
  },
});
