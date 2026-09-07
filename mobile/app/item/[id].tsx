import { ServiceHistory } from "../../components/ServiceHistory";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card, CardTitle } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { ReminderRow } from "../../components/ReminderRow";
import { DocumentPickerModal } from "../../components/DocumentPickerModal";
import { CATEGORIES } from "../../lib/categories";
import { formatCurrencyTRY, formatDateTR, todayIso } from "../../lib/date-utils";
import { useAldimStore } from "../../lib/store";
import { colors, fontSize, radius, spacing } from "../../lib/theme";
import type { ItemFieldValue } from "../../lib/types";

/**
 * Detay header'ında **custom back button** kullanıyoruz: kullanıcı
 * detay'a hangi yoldan gelirse gelsin (yeni kayıt sonrası replace+push,
 * Kayıtlar listesinden push, Ana sayfa "Son kayıtlar"dan push) — back
 * her zaman Kayıtlar tab'ına döner. Bu navigation davranışını
 * deterministic hale getirir; (tabs) gibi iç route adlarının back
 * button'da yazma sorununu da kökten çözer.
 */
function BackToItems({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <Pressable
      onPress={() => {
        // dismissTo expo-router 6'da stack'i hedefe kadar pop'lar; yoksa fallback
        if (router.canGoBack()) router.back();
        else router.replace("/(tabs)/items");
      }}
      hitSlop={12}
      style={({ pressed }) => [
        styles.backBtn,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Ionicons name="chevron-back" size={24} color={colors.brand[700]} />
      <Text style={styles.backText}>Kayıtlar</Text>
    </Pressable>
  );
}

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { items, reminders, deleteItem, addDocumentToItem } = useAldimStore();
  const item = items.find((i) => i.id === id);
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [docPickerOpen, setDocPickerOpen] = useState(false);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: spacing.lg }}>
          <EmptyState
            title="Kayıt bulunamadı"
            description="Aradığın kayıt silinmiş olabilir."
            action={<Button title="Geri dön" onPress={() => router.back()} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  const spec = CATEGORIES[item.category];
  const itemReminders = reminders.filter((r) => r.itemId === item.id);

  const onDelete = () => {
    Alert.alert(
      "Kaydı sil",
      `${item.title} ve bağlı tüm hatırlatmalar silinecek. Emin misin?`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try { await deleteItem(item.id); router.back(); } catch (error) { Alert.alert("Silinemedi", (error as Error).message); }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerLeft: () => <BackToItems router={router} />,
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Özet */}
        <Card style={{ gap: spacing.sm }}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <Ionicons name={spec.icon} size={22} color={colors.brand[700]} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Badge tone="neutral">{spec.label}</Badge>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              {(item.brand || item.store) && (
                <Text style={styles.subtitle}>
                  {[item.brand, item.store].filter(Boolean).join(" · ")}
                </Text>
              )}
            </View>
          </View>
          {(item.price !== undefined || item.purchaseDate) && (
            <View style={styles.metaRow}>
              {item.price !== undefined && (
                <InfoBlock label="Fiyat" value={formatCurrencyTRY(item.price)} />
              )}
              {item.purchaseDate && (
                <InfoBlock label="Satın alma" value={formatDateTR(item.purchaseDate)} />
              )}
            </View>
          )}
        </Card>

        {/* Kategoriye özel alanlar — essential üstte, detay accordion */}
        {(() => {
          const fieldsWithValue = spec.fields.filter((f) => {
            if (f.topLevel) return false;
            const raw = item.fields[f.key];
            return raw !== undefined && raw !== "" && raw !== false;
          });
          const essentialDetails = fieldsWithValue.filter(
            (f) => f.essential !== false,
          );
          const otherDetails = fieldsWithValue.filter(
            (f) => f.essential === false,
          );
          if (fieldsWithValue.length === 0) return null;
          return (
            <Card style={{ gap: spacing.sm }}>
              <CardTitle>Detaylar</CardTitle>
              <View style={{ gap: spacing.xs }}>
                {essentialDetails.map((f) => (
                  <DetailRow
                    key={f.key}
                    label={f.label}
                    value={formatValue(item.fields[f.key], f.type)}
                  />
                ))}
              </View>
              {otherDetails.length > 0 && (
                <>
                  {showAllDetails && (
                    <View
                      style={{
                        gap: spacing.xs,
                        marginTop: spacing.sm,
                        paddingTop: spacing.sm,
                        borderTopWidth: 1,
                        borderTopColor: colors.ink[100],
                      }}
                    >
                      {otherDetails.map((f) => (
                        <DetailRow
                          key={f.key}
                          label={f.label}
                          value={formatValue(item.fields[f.key], f.type)}
                        />
                      ))}
                    </View>
                  )}
                  <Pressable
                    onPress={() => setShowAllDetails((s) => !s)}
                    style={({ pressed }) => [
                      styles.toggleAll,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={styles.toggleText}>
                      {showAllDetails
                        ? "Daha az göster"
                        : `Tüm detayları göster (${otherDetails.length})`}
                    </Text>
                    <Ionicons
                      name={showAllDetails ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={colors.brand[700]}
                    />
                  </Pressable>
                </>
              )}
            </Card>
          );
        })()}

        {/* Hatırlatmalar */}
        {itemReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hatırlatmalar</Text>
            <View style={{ gap: spacing.sm }}>
              {itemReminders.map((r) => (
                <ReminderRow key={r.id} reminder={r} disabled />
              ))}
            </View>
          </View>
        )}

        {/* Belgeler */}
        <Card style={{ gap: spacing.sm }}>
          <View style={styles.docHeaderRow}>
            <View style={styles.iconRow}>
              <Ionicons name="folder-outline" size={18} color={colors.brand[700]} />
              <CardTitle>Belgeler</CardTitle>
            </View>
            {item.documents.length > 0 && (
              <Pressable
                onPress={() => setDocPickerOpen(true)}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.addDocBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="add" size={16} color={colors.brand[700]} />
                <Text style={styles.addDocText}>Ekle</Text>
              </Pressable>
            )}
          </View>
          {item.documents.length === 0 ? (
            <View style={styles.emptyDocs}>
              <Text style={styles.muted}>Henüz belge eklenmemiş.</Text>
              <Text style={styles.docsHint}>
                Fatura, garanti belgesi veya servis formunu ekleyerek kaydını
                güçlendirebilirsin.
              </Text>
              <View style={{ marginTop: spacing.sm }}>
                <Button
                  title="Belge ekle"
                  onPress={() => setDocPickerOpen(true)}
                  leftIcon={
                    <Ionicons name="add" size={16} color={colors.white} />
                  }
                />
              </View>
            </View>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {item.documents.map((d) => (
                <Pressable
                  key={d.id}
                  onPress={() => router.push(`/document/${d.id}`)}
                  style={({ pressed }) => [
                    styles.docRow,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  {d.fileUri ? (
                    <Image source={{ uri: d.fileUri }} style={styles.docThumb} />
                  ) : (
                    <View style={[styles.docThumb, styles.docThumbEmpty]}>
                      <Ionicons
                        name="document-outline"
                        size={20}
                        color={colors.brand[700]}
                      />
                    </View>
                  )}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.docName} numberOfLines={1}>
                      {d.name}
                    </Text>
                    <Text style={styles.docMeta}>{formatDateTR(d.date)}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.ink[400]}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </Card>

        {/* Notlar */}
        {item.notes && (
          <Card>
            <CardTitle>Notlar</CardTitle>
            <Text style={[styles.muted, { marginTop: 6 }]}>{item.notes}</Text>
          </Card>
        )}

        <ServiceHistory itemId={item.id} />

        {/* Aksiyonlar */}
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Button
              title="Düzenle"
              onPress={() => router.push(`/item/${item.id}/edit`)}
              fullWidth
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Sil" variant="outline" onPress={onDelete} fullWidth />
          </View>
        </View>
      </ScrollView>

      <DocumentPickerModal
        visible={docPickerOpen}
        category={item.category}
        onClose={() => setDocPickerOpen(false)}
        onPick={async (fileUri, type) => {
          try { const created = await addDocumentToItem(item.id, {
            type,
            date: todayIso(),
            fileUri,
          });
          if (created) {
            Alert.alert("Belge eklendi", `"${created.name}" kayda eklendi.`);
          } else {
            Alert.alert(
              "Belge kaydedilemedi",
              "Lütfen tekrar dene. Görsel cihazdan okunamadıysa farklı bir belge seç.",
            );
          }
          } catch (error) { Alert.alert("Belge yüklenemedi", (error as Error).message); }
        }}
      />
    </SafeAreaView>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function formatValue(v: ItemFieldValue, type: string): string {
  if (typeof v === "boolean") return v ? "Evet" : "Hayır";
  if (typeof v === "number") {
    if (type === "currency") return formatCurrencyTRY(v);
    return String(v);
  }
  if (typeof v === "string") {
    if (type === "date") return formatDateTR(v);
    return v;
  }
  return "—";
}

const styles = StyleSheet.create({
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 6,
    marginLeft: -4,
  },
  backText: {
    color: colors.brand[700],
    fontSize: fontSize.base,
    fontWeight: "500",
    marginLeft: -2,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing["3xl"],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.ink[900],
    marginTop: 6,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.ink[500],
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.ink[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.ink[900],
    marginTop: 2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    gap: spacing.md,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.ink[500],
  },
  detailValue: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.ink[900],
    textAlign: "right",
  },
  toggleAll: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  toggleText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.brand[700],
  },
  muted: {
    fontSize: fontSize.sm,
    color: colors.ink[600],
    lineHeight: 20,
  },
  section: { gap: spacing.md },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.ink[900],
  },
  docHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  addDocBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.brand[50],
  },
  addDocText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.brand[700],
  },
  emptyDocs: {
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: 4,
  },
  docsHint: {
    fontSize: fontSize.xs,
    color: colors.ink[500],
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 280,
  },
  docRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    paddingVertical: 4,
  },
  docThumb: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.ink[100],
  },
  docThumbEmpty: {
    alignItems: "center",
    justifyContent: "center",
  },
  docName: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.ink[900],
  },
  docMeta: {
    fontSize: fontSize.xs,
    color: colors.ink[500],
    marginTop: 2,
  },
});
