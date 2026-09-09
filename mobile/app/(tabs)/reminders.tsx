import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../components/EmptyState";
import { Header } from "../../components/Header";
import { ReminderRow } from "../../components/ReminderRow";
import { CATEGORIES } from "../../lib/categories";
import { daysUntil } from "../../lib/date-utils";
import { useAldimStore } from "../../lib/store";
import { colors, fontSize, radius, spacing } from "../../lib/theme";
import type { ItemCategory, Reminder } from "../../lib/types";

type Filter =
  | "all"
  | { kind: "category"; category: ItemCategory }
  | { kind: "type"; type: Reminder["type"] };

interface FilterChip {
  id: string;
  label: string;
  filter: Filter;
}

const FILTERS: FilterChip[] = [
  { id: "all", label: "Tümü", filter: "all" },
  {
    id: "cat:electronics",
    label: "Elektronik",
    filter: { kind: "category", category: "electronics" },
  },
  {
    id: "cat:vehicle",
    label: "Araç",
    filter: { kind: "category", category: "vehicle" },
  },
  {
    id: "cat:home_bill",
    label: "Fatura",
    filter: { kind: "category", category: "home_bill" },
  },
  {
    id: "cat:subscription",
    label: "Abonelik",
    filter: { kind: "category", category: "subscription" },
  },
  {
    id: "cat:insurance",
    label: "Sigorta",
    filter: { kind: "category", category: "insurance" },
  },
  {
    id: "type:return_deadline",
    label: "İade",
    filter: { kind: "type", type: "return_deadline" },
  },
  {
    id: "type:warranty_end",
    label: "Garanti",
    filter: { kind: "type", type: "warranty_end" },
  },
  {
    id: "type:bill_due",
    label: "Fatura ödeme",
    filter: { kind: "type", type: "bill_due" },
  },
  {
    id: "type:vehicle_inspection",
    label: "Muayene",
    filter: { kind: "type", type: "vehicle_inspection" },
  },
  { id: "type:mtv", label: "MTV", filter: { kind: "type", type: "mtv" } },
];

export default function RemindersScreen() {
  const { reminders, hydrated, completeReminder } = useAldimStore();
  const [filterId, setFilterId] = useState("all");
  const activeFilter = FILTERS.find((f) => f.id === filterId)?.filter ?? "all";

  const filtered = useMemo(() => {
    return reminders
      .filter((r) => r.status === "active")
      .filter((r) => {
        if (activeFilter === "all") return true;
        if (typeof activeFilter === "object") {
          if (activeFilter.kind === "category") {
            return r.itemCategory === activeFilter.category;
          }
          if (activeFilter.kind === "type") return r.type === activeFilter.type;
        }
        return true;
      })
      .map((r) => ({ r, left: daysUntil(r.dueDate) }))
      .sort((a, b) => a.left - b.left)
      .map((x) => x.r);
  }, [reminders, activeFilter]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Header
          title="Hatırlatmalar"
          subtitle="Ödemeler, garantiler ve unutmaman gereken tarihler."
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, paddingVertical: 4 }}
          style={{ marginBottom: spacing.lg }}
        >
          {FILTERS.map((f) => {
            const active = filterId === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFilterId(f.id)}
                style={[
                  styles.chip,
                  active && {
                    backgroundColor: colors.ink[900],
                    borderColor: colors.ink[900],
                  },
                ]}
              >
                <Text
                  style={[styles.chipText, active && { color: colors.white }]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {!hydrated
          ? <View style={styles.skeleton} />
          : filtered.length === 0
          ? (
            <EmptyState
              icon={
                <Ionicons
                  name="notifications-outline"
                  size={28}
                  color={colors.brand[700]}
                />
              }
              title="Yaklaşan bir hatırlatma yok"
              description="Kayıt ekledikçe önemli tarihler burada görünür."
            />
          )
          : (
            <View style={{ gap: spacing.sm }}>
              {filtered.map((r) => (
                <View key={r.id}>
                  <ReminderRow reminder={r} />
                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        "Tamamla",
                        ["bill_due", "subscription_renewal"].includes(r.type)
                          ? "Bu ödeme harcama geçmişine kaydedilecek."
                          : "Hatırlatma tamamlandı olarak işaretlenecek.",
                        [
                          { text: "Vazgeç", style: "cancel" },
                          {
                            text: "Tamamla",
                            onPress: async () => {
                              try {
                                await completeReminder(r.id);
                              } catch (e) {
                                Alert.alert(
                                  "Kaydedilemedi",
                                  (e as Error).message,
                                );
                              }
                            },
                          },
                        ],
                      )}
                    style={{ padding: 12, alignItems: "flex-end" }}
                  >
                    <Text
                      style={{ color: colors.brand[700], fontWeight: "600" }}
                    >
                      {["bill_due", "subscription_renewal"].includes(r.type)
                        ? "Ödendi olarak işaretle"
                        : "Tamamla"}
                    </Text>
                  </Pressable>
                  <Text style={styles.category}>
                    {CATEGORIES[r.itemCategory].label} · {r.itemTitle}
                  </Text>
                </View>
              ))}
            </View>
          )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.ink[200],
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.ink[700],
  },
  category: {
    fontSize: fontSize.xs,
    color: colors.ink[400],
    marginTop: 4,
    marginLeft: spacing.md,
  },
  skeleton: {
    height: 80,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ink[100],
  },
});
