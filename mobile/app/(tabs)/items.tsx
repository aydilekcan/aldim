import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { Header } from "../../components/Header";
import { ItemRow } from "../../components/ItemRow";
import { CATEGORIES } from "../../lib/categories";
import { useAldimStore } from "../../lib/store";
import { colors, fontSize, radius, spacing } from "../../lib/theme";
import type { ItemCategory } from "../../lib/types";

type Filter = "all" | ItemCategory;

const FILTERS: Filter[] = [
  "all",
  "electronics",
  "white_goods",
  "small_appliance",
  "vehicle",
  "home_bill",
  "subscription",
  "insurance",
  "other",
];

function filterLabel(f: Filter): string {
  if (f === "all") return "Tümü";
  return CATEGORIES[f].label;
}

export default function ItemsScreen() {
  const router = useRouter();
  const { items, reminders, hydrated } = useAldimStore();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.category === filter);
  }, [items, filter]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Header
          title="Kayıtların"
          subtitle="Tüm kayıtlar, kategori ve yaklaşan tarihler."
          right={
            <Button
              title="Ekle"
              size="sm"
              leftIcon={<Ionicons name="add" size={16} color={colors.white} />}
              onPress={() => router.push("/item/new")}
            />
          }
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, paddingVertical: 4 }}
          style={{ marginBottom: spacing.lg }}
        >
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[
                  styles.chip,
                  active && {
                    backgroundColor: colors.brand[700],
                    borderColor: colors.brand[700],
                  },
                ]}
              >
                <Text style={[styles.chipText, active && { color: colors.white }]}>
                  {filterLabel(f)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {!hydrated ? (
          <View style={styles.skeleton} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Ionicons name="albums-outline" size={28} color={colors.brand[700]} />}
            title={
              filter === "all" ? "Henüz kayıt yok" : "Bu kategoride kayıt yok"
            }
            description={
              filter === "all"
                ? "İlk kaydını eklemeye başla — kategori seç ve önemli tarihleri gir."
                : "Başka bir kategoriye geç veya yeni kayıt ekle."
            }
            action={
              <Button
                title="Yeni kayıt ekle"
                onPress={() => router.push("/item/new")}
              />
            }
          />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {filtered.map((i) => (
              <ItemRow key={i.id} item={i} reminders={reminders} />
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
  skeleton: {
    height: 120,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ink[100],
  },
});
