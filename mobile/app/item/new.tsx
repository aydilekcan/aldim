import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryPicker } from "../../components/CategoryPicker";
import { Header } from "../../components/Header";
import {
  defaultValuesForCategory,
  ItemForm,
  type ItemFormSubmit,
} from "../../components/ItemForm";
import { CATEGORIES } from "../../lib/categories";
import { getNotificationPermissionStatus } from "../../lib/notifications";
import { useAldimStore } from "../../lib/store";
import { fontSize, spacing } from "../../lib/theme";
import type { ItemCategory } from "../../lib/types";

export default function NewItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const initialCategory =
    params.category && params.category in CATEGORIES
      ? (params.category as ItemCategory)
      : null;
  const [selected, setSelected] = useState<ItemCategory | null>(
    initialCategory,
  );
  const { addItem, addDocumentToItem } = useAldimStore();
  const [saving, setSaving] = useState(false);

  if (!selected) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pickerContainer}>
          <Header
            title="Yeni kayıt ekle"
            subtitle="Kategori seç, alanlar otomatik gelir."
          />
          <CategoryPicker onSelect={setSelected} />
          <Text style={styles.disclaimer}>
            Aldım resmi ödeme veya sorgulama hizmeti sunmaz. Girdiğin tarihlere
            göre hatırlatma yapar.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const onSubmit = async (
    submit: ItemFormSubmit,
    invoiceImageUri: string | null,
  ) => {
    if (saving) return;
    setSaving(true);
    try {
      const created = await addItem({
        category: selected,
        title: submit.top.title,
        brand: submit.top.brand,
        model: submit.top.model,
        store: submit.top.store,
        price: submit.top.price,
        purchaseDate: submit.top.purchaseDate,
        notes: submit.top.notes,
        fields: submit.fields,
      });

      if (invoiceImageUri) {
        // Fire-and-await: kopyalama başarısız olursa kullanıcı yine de kaydı
        // gördüğü için sessizce devam ediyoruz; belge yoksa item detayında
        // "Henüz belge eklenmemiş" görünür.
        try {
          await addDocumentToItem(created.id, {
            type: selected === "home_bill" ? "bill" : "invoice",
            date:
              submit.top.purchaseDate ?? new Date().toISOString().slice(0, 10),
            fileUri: invoiceImageUri,
          });
        } catch (error) {
          Alert.alert(
            "Kayıt eklendi; belge yüklenemedi",
            (error as Error).message,
          );
          router.replace(`/item/${created.id}`);
          return;
        }
      }

      const perm = await getNotificationPermissionStatus();
      const spec = CATEGORIES[selected];
      const message =
        perm === "granted"
          ? spec.successMessage
          : "Kayıt oluşturuldu. Hatırlatma gönderebilmek için bildirim izni gerekiyor.";
      Alert.alert("Eklendi", message, [
        {
          text: "Tamam",
          onPress: () => {
            // 1) new ekranını stack'ten çıkar — Kayıtlar tab'ı açılır.
            router.replace("/(tabs)/items");
            // 2) Detayı push et — back button "Kayıtlar"a düzgün döner.
            router.push(`/item/${created.id}`);
          },
        },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const spec = CATEGORIES[selected];

  return (
    <ItemForm
      category={selected}
      initial={defaultValuesForCategory(selected)}
      submitLabel={spec.submitLabel}
      saving={saving}
      onSubmit={onSubmit}
      onCancel={() => {
        if (initialCategory) router.back();
        else setSelected(null);
      }}
    />
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    padding: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  disclaimer: {
    fontSize: fontSize.xs,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: spacing.xl,
    lineHeight: 18,
  },
});
