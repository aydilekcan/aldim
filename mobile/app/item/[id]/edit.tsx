import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../components/Button";
import { EmptyState } from "../../../components/EmptyState";
import {
  ItemForm,
  type ItemFormSubmit,
  itemToFormValues,
} from "../../../components/ItemForm";
import { useAldimStore } from "../../../lib/store";
import { spacing } from "../../../lib/theme";

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { items, updateItem } = useAldimStore();
  const item = items.find((i) => i.id === id);
  const [saving, setSaving] = useState(false);

  const initial = useMemo(() => {
    if (!item) return null;
    return itemToFormValues(item.category, item);
  }, [item]);

  if (!item || !initial) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: spacing.lg }}>
          <EmptyState
            title="Kayıt bulunamadı"
            description="Düzenlemek istediğin kayıt silinmiş olabilir."
            action={<Button title="Geri dön" onPress={() => router.back()} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  const onSubmit = async (submit: ItemFormSubmit) => {
    if (saving) return;
    setSaving(true);
    try {
      const result = await updateItem(item.id, {
        title: submit.top.title,
        brand: submit.top.brand,
        model: submit.top.model,
        store: submit.top.store,
        price: submit.top.price,
        purchaseDate: submit.top.purchaseDate,
        notes: submit.top.notes,
        fields: submit.fields,
      });

      if (!result.ok) {
        Alert.alert("Bulunamadı", "Kayıt silinmiş gibi görünüyor.");
        router.back();
        return;
      }

      const message = result.permissionGranted
        ? "Kayıt güncellendi. Hatırlatmalar yenilendi."
        : "Kayıt güncellendi. Hatırlatma gönderebilmek için bildirim izni gerekiyor.";
      Alert.alert("Güncellendi", message);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ItemForm
      category={item.category}
      initial={initial}
      submitLabel="Değişiklikleri kaydet"
      saving={saving}
      onSubmit={onSubmit}
      onCancel={() => router.back()}
      showImagePicker={false}
    />
  );
}
