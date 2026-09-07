import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "./Button";
import { Card, CardTitle } from "./Card";
import { DateField, Field, TextField } from "./Field";
import { CATEGORIES, type FieldSpec } from "../lib/categories";
import { colors, fontSize, radius, spacing } from "../lib/theme";
import type { ItemCategory, ItemFieldValue } from "../lib/types";
import { formatMoneyInput } from "../../shared/money";
import { todayIso } from "../../shared/date-utils";
import { parseAmount } from "../../shared/domain";
import { isNonEmptyString } from "../lib/utils";

/* ----------------------------------------------------------------------
 * ItemForm — kategori şemasına göre tüm alanları render eder.
 *
 * Çıktı `ItemFormSubmit` katmanlı bir nesnedir:
 *   - top: { title, brand?, model?, store?, price?, purchaseDate?, notes? }
 *   - fields: kategoriye özel diğer tüm alanlar (string/number/boolean)
 * Bu sayede store action'ı doğrudan AldimItem'ı yazabilir.
 * ------------------------------------------------------------------- */

export interface ItemFormSubmit {
  top: {
    title: string;
    brand?: string;
    model?: string;
    store?: string;
    price?: number;
    purchaseDate?: string;
    notes?: string;
  };
  fields: Record<string, ItemFieldValue>;
}

export type ItemFormValues = Record<string, string | boolean>;

export function defaultValuesForCategory(
  category: ItemCategory,
): ItemFormValues {
  const spec = CATEGORIES[category];
  const out: ItemFormValues = {};
  for (const f of spec.fields) {
    if (f.type === "boolean") out[f.key] = false;
    else out[f.key] = "";
  }
  return out;
}

interface Props {
  category: ItemCategory;
  initial: ItemFormValues;
  submitLabel: string;
  saving: boolean;
  onSubmit: (
    submit: ItemFormSubmit,
    invoiceImageUri: string | null,
  ) => Promise<void> | void;
  onCancel: () => void;
  /** Edit'te kategori kilitli — buton hidden veya disabled */
  showImagePicker?: boolean;
}

export function ItemForm({
  category,
  initial,
  submitLabel,
  saving,
  onSubmit,
  onCancel,
  showImagePicker = true,
}: Props) {
  const spec = CATEGORIES[category];
  const [v, setV] = useState<ItemFormValues>(() =>
    Object.fromEntries(
      Object.entries(initial).map(([key, value]) => [
        key,
        spec.fields.find((f) => f.key === key)?.type === "currency" &&
        value !== ""
          ? formatMoneyInput(Number(value))
          : value,
      ]),
    ),
  );
  const [invoiceImageUri, setInvoiceImageUri] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Essential ve detay alanlarını ayır — essential ilk açılışta görünür
  const essentialFields = spec.fields.filter((f) => f.essential !== false);
  const detailFields = spec.fields.filter((f) => f.essential === false);

  const setVal = (key: string, value: string | boolean) =>
    setV((prev) => ({ ...prev, [key]: value }));

  const onPickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("İzin gerekli", "Galeriye erişim izni vermen gerekiyor.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        setInvoiceImageUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Hata", "Görsel seçilemedi.");
    }
  };

  const submit = async () => {
    if (saving) return;
    // Validate required
    for (const f of spec.fields) {
      if (!f.required) continue;
      const val = v[f.key];
      if (typeof val === "boolean") continue;
      if (!isNonEmptyString(val)) {
        Alert.alert("Eksik bilgi", `${f.label} alanı gerekli.`);
        return;
      }
    }

    if (typeof v.purchaseDate === "string" && v.purchaseDate > todayIso()) {
      Alert.alert("Geçersiz tarih", "Satın alma tarihi bugünden sonra olamaz.");
      return;
    }
    // Build top + fields
    const top: ItemFormSubmit["top"] = { title: "" };
    const fields: Record<string, ItemFieldValue> = {};

    for (const f of spec.fields) {
      const val = v[f.key];
      if (f.type === "boolean") {
        if (f.topLevel) {
          // boolean topLevel henüz desteklenmiyor — defensive guard
          (top as Record<string, ItemFieldValue>)[f.key] = val as boolean;
        } else {
          fields[f.key] = val as boolean;
        }
        continue;
      }
      const s = (val as string).trim();
      if (!s) continue;
      let parsed: ItemFieldValue = s;
      if (f.type === "number" || f.type === "currency") {
        let num: number;
        try {
          num = f.type === "currency" ? parseAmount(s) : Number(s);
        } catch {
          Alert.alert(
            "Geçersiz tutar",
            `${f.label}: 1.250,50 gibi bir tutar gir.`,
          );
          return;
        }
        if (!Number.isFinite(num) || num < 0) {
          Alert.alert("Geçersiz sayı", f.label);
          return;
        }
        parsed = num;
      }
      if (f.topLevel) {
        (top as Record<string, ItemFieldValue>)[f.key] = parsed;
      } else {
        fields[f.key] = parsed;
      }
    }

    if (!top.title || (typeof top.title === "string" && !top.title.trim())) {
      Alert.alert("Eksik bilgi", `${spec.titleLabel} alanı gerekli.`);
      return;
    }

    try {
      await onSubmit({ top, fields }, invoiceImageUri);
    } catch (error) {
      Alert.alert("Kaydedilemedi", (error as Error).message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Kategori başlığı */}
        <View style={styles.headerBlock}>
          <View style={styles.categoryIcon}>
            <Ionicons name={spec.icon} size={22} color={colors.brand[700]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.categoryLabel}>{spec.label}</Text>
            <Text style={styles.categoryDesc}>{spec.description}</Text>
          </View>
        </View>

        {/* Temel bilgiler — her zaman görünür */}
        <Card style={{ gap: spacing.xs }}>
          <CardTitle>Temel bilgiler</CardTitle>
          {essentialFields.map((f) => (
            <FieldRenderer
              key={f.key}
              spec={f}
              value={v[f.key]}
              onChange={setVal}
            />
          ))}
        </Card>

        {/* Detaylı bilgiler — accordion */}
        {detailFields.length > 0 && (
          <Card style={{ gap: spacing.xs }}>
            <Pressable
              onPress={() => setShowDetails((s) => !s)}
              style={({ pressed }) => [
                styles.accordionHeader,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <CardTitle>Detaylı bilgileri ekle</CardTitle>
                <Text style={styles.accordionHint}>
                  {showDetails
                    ? "Daha az göster"
                    : `${detailFields.length} opsiyonel alan`}
                </Text>
              </View>
              <Ionicons
                name={showDetails ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.brand[700]}
              />
            </Pressable>
            {showDetails && (
              <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
                {detailFields.map((f) => (
                  <FieldRenderer
                    key={f.key}
                    spec={f}
                    value={v[f.key]}
                    onChange={setVal}
                  />
                ))}
              </View>
            )}
          </Card>
        )}

        {showImagePicker && (
          <Card style={{ gap: spacing.xs }}>
            <CardTitle>Belge</CardTitle>
            <Pressable onPress={onPickImage} style={styles.imagePicker}>
              {invoiceImageUri ? (
                <Image source={{ uri: invoiceImageUri }} style={styles.image} />
              ) : (
                <View style={styles.imageEmpty}>
                  <Ionicons
                    name="image-outline"
                    size={28}
                    color={colors.brand[700]}
                  />
                  <Text style={styles.imageText}>
                    Fatura / belge fotoğrafı ekle
                  </Text>
                  <Text style={styles.imageHint}>Galeriden seç</Text>
                </View>
              )}
            </Pressable>
            {invoiceImageUri && (
              <Pressable onPress={() => setInvoiceImageUri(null)}>
                <Text style={styles.remove}>Görseli kaldır</Text>
              </Pressable>
            )}
          </Card>
        )}

        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <Button title="Vazgeç" variant="outline" onPress={onCancel} />
          <View style={{ flex: 1 }}>
            <Button
              title={submitLabel}
              loading={saving}
              onPress={submit}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- Tek field renderer ---------------- */

function FieldRenderer({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec;
  value: string | boolean | undefined;
  onChange: (key: string, v: string | boolean) => void;
}) {
  if (spec.type === "boolean") {
    return (
      <View style={styles.boolRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.boolLabel}>{spec.label}</Text>
          {spec.hint ? <Text style={styles.boolHint}>{spec.hint}</Text> : null}
        </View>
        <Switch
          value={Boolean(value)}
          onValueChange={(b) => onChange(spec.key, b)}
          trackColor={{ false: colors.ink[200], true: colors.brand[200] }}
          thumbColor={value ? colors.brand[700] : colors.white}
        />
      </View>
    );
  }

  if (spec.type === "date") {
    return (
      <Field
        label={spec.label}
        hint={spec.hint}
        error={
          spec.key === "purchaseDate" &&
          typeof value === "string" &&
          value > todayIso()
            ? "Satın alma tarihi bugünden sonra olamaz."
            : undefined
        }
      >
        <DateField
          value={typeof value === "string" ? value : undefined}
          onChange={(iso) => onChange(spec.key, iso)}
          maximumDate={spec.key === "purchaseDate" ? new Date() : undefined}
        />
      </Field>
    );
  }

  if (spec.type === "select") {
    return (
      <Field label={spec.label} hint={spec.hint}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, paddingVertical: 4 }}
        >
          {spec.options?.map((opt) => {
            const active = value === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => onChange(spec.key, opt.value)}
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
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Field>
    );
  }

  if (spec.type === "currency")
    return (
      <Field label={spec.label} hint={spec.hint}>
        <View style={{ position: "relative" }}>
          <TextField
            accessibilityLabel={spec.label}
            value={formatMoneyInput(typeof value === "string" ? value : "")}
            onChangeText={(text) => onChange(spec.key, formatMoneyInput(text))}
            keyboardType="decimal-pad"
            inputMode="decimal"
            placeholder="0"
            style={{ paddingRight: 38, fontVariant: ["tabular-nums"] }}
          />
          <Text
            style={{
              position: "absolute",
              right: 16,
              top: 15,
              color: colors.ink[500],
            }}
          >
            ₺
          </Text>
        </View>
      </Field>
    );
  // text, textarea, number
  return (
    <Field label={spec.label} hint={spec.hint}>
      <TextField
        value={typeof value === "string" ? value : ""}
        onChangeText={(t) => onChange(spec.key, t)}
        placeholder={spec.placeholder}
        multiline={spec.type === "textarea"}
        numberOfLines={spec.type === "textarea" ? 3 : undefined}
        style={
          spec.type === "textarea"
            ? { minHeight: 80, textAlignVertical: "top" }
            : undefined
        }
        keyboardType={spec.type === "number" ? "decimal-pad" : "default"}
        inputMode={spec.type === "number" ? "decimal" : "text"}
        autoCapitalize={spec.key === "plate" ? "characters" : "sentences"}
      />
    </Field>
  );
}

/* ---------------- Helpers ---------------- */

/** Bir AldimItem'ı ItemFormValues'a dönüştürür (edit ekranında initial olarak). */
export function itemToFormValues(
  category: ItemCategory,
  item: {
    title?: string;
    brand?: string;
    model?: string;
    store?: string;
    price?: number;
    purchaseDate?: string;
    notes?: string;
    fields: Record<string, ItemFieldValue>;
  },
): ItemFormValues {
  const spec = CATEGORIES[category];
  const out: ItemFormValues = {};
  for (const f of spec.fields) {
    let raw: ItemFieldValue;
    if (f.topLevel) {
      const top = item as unknown as Record<string, ItemFieldValue>;
      raw = top[f.key];
    } else {
      raw = item.fields[f.key];
    }
    if (f.type === "boolean") {
      out[f.key] = typeof raw === "boolean" ? raw : false;
    } else if (typeof raw === "number") {
      out[f.key] = String(raw);
    } else if (typeof raw === "string") {
      out[f.key] = raw;
    } else {
      out[f.key] = "";
    }
  }
  return out;
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing["3xl"],
  },
  headerBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.ink[900],
  },
  categoryDesc: {
    fontSize: fontSize.sm,
    color: colors.ink[500],
    marginTop: 2,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  accordionHint: {
    fontSize: fontSize.xs,
    color: colors.ink[500],
    marginTop: 2,
  },
  boolRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  boolLabel: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.ink[800],
  },
  boolHint: {
    fontSize: fontSize.xs,
    color: colors.ink[500],
    marginTop: 2,
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
  imagePicker: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ink[200],
    borderStyle: "dashed",
    backgroundColor: colors.ink[50],
    overflow: "hidden",
  },
  image: { width: "100%", height: 180 },
  imageEmpty: {
    padding: spacing.xl,
    alignItems: "center",
    gap: 4,
  },
  imageText: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.ink[800],
    marginTop: spacing.sm,
  },
  imageHint: {
    fontSize: fontSize.xs,
    color: colors.ink[500],
  },
  remove: {
    fontSize: fontSize.sm,
    color: colors.danger[600],
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
