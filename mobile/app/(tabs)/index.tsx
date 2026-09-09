import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAldimStore } from "../../lib/store";
import { colors } from "../../lib/theme";
import { formatCurrencyTRY } from "../../lib/date-utils";
import { spendingSummary } from "../../../shared/domain";
import { ItemRow } from "../../components/ItemRow";
import { ReminderRow } from "../../components/ReminderRow";
import { EmptyState } from "../../components/EmptyState";
import type { ItemCategory } from "../../lib/types";
const QUICK: {
  category: ItemCategory;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    category: "electronics",
    title: "Ürün ekle",
    icon: "phone-portrait-outline",
  },
  {
    category: "home_bill",
    title: "Fatura ekle",
    icon: "receipt-outline",
  },
  {
    category: "subscription",
    title: "Abonelik ekle",
    icon: "card-outline",
  },
  {
    category: "vehicle",
    title: "Araç ekle",
    icon: "car-outline",
  },
];
export default function HomeScreen() {
  const router = useRouter();
  const { items, reminders, payments, syncNow, syncStatus, syncError } =
    useAldimStore();
  const summary = spendingSummary(items, payments);
  const upcoming = reminders
    .filter((r) => r.status !== "completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl
            refreshing={syncStatus === "syncing"}
            onRefresh={() => void syncNow()}
            tintColor={colors.brand[700]}
          />
        }
      >
        <View style={s.brandRow}>
          <Text style={s.brand}>
            aldım<Text style={{ color: colors.brand[700] }}>•</Text>
          </Text>
          <Pressable
            accessibilityLabel="Ayarlar"
            onPress={() => router.push("/settings")}
            style={s.settings}
          >
            <Ionicons
              name="settings-outline"
              size={21}
              color={colors.brand[700]}
            />
          </Pressable>
        </View>
        <Text style={s.eyebrow}>
          {new Date().toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            weekday: "long",
          })}
        </Text>
        <Text style={s.title}>Genel bakış</Text>
        <Text style={s.description}>
          Bu ay ne harcadın, sırada ne var?
        </Text>
        {syncError && (
          <View style={s.error}>
            <Text style={{ color: colors.danger[600] }}>
              Veriler güncellenemedi. Yenilemek için aşağı çek.
            </Text>
          </View>
        )}
        <Pressable
          accessibilityLabel="Harcama geçmişini aç"
          style={s.hero}
          onPress={() => router.push("/spending")}
        >
          <View style={s.brandRow}>
            <Text style={s.heroLabel}>Bu ayki harcaman</Text>
            <Ionicons name="arrow-forward" size={21} color={colors.ink[500]} />
          </View>
          <Text style={s.amount} adjustsFontSizeToFit numberOfLines={1}>
            {formatCurrencyTRY(summary.thisMonth)}
          </Text>
          <Text style={s.heroHint}>
            Alışverişlerin ve kaydettiğin ödemelerin toplamı
          </Text>
        </Pressable>
        <View style={s.metrics}>
          <View style={s.metric}>
            <Ionicons name="card-outline" size={20} color={colors.brand[700]} />
            <Text style={s.metricValue}>
              {formatCurrencyTRY(summary.subscriptions)}
            </Text>
            <Text style={s.metricLabel}>Aylık abonelik yükü</Text>
          </View>
          <Pressable
            style={s.metric}
            onPress={() => router.push("/(tabs)/documents")}
          >
            <Ionicons
              name="folder-open-outline"
              size={20}
              color={colors.brand[700]}
            />
            <Text style={s.metricValue}>{summary.documents} belge</Text>
            <Text style={s.metricLabel}>Belgeleri aç</Text>
          </Pressable>
        </View>
        <View style={s.sectionRow}>
          <Text style={s.section}>Takip edilecekler</Text>
          <Pressable onPress={() => router.push("/(tabs)/reminders")}>
            <Text style={s.link}>Tümünü gör →</Text>
          </Pressable>
        </View>
        {upcoming.length
          ? (
            <View>
              {upcoming.map((r) => <ReminderRow key={r.id} reminder={r} />)}
            </View>
          )
          : (
            <EmptyState
              title="Yaklaşan bir tarih yok"
              description="Kayıtlarına eklediğin önemli tarihler burada görünür."
            />
          )}
        <Text style={s.section}>Hızlı ekle</Text>
        <View style={s.grid}>
          {QUICK.map((q) => (
            <Pressable
              key={q.category}
              style={s.quick}
              onPress={() => router.push(`/item/new?category=${q.category}`)}
            >
              <Ionicons name={q.icon} size={20} color={colors.ink[500]} />
              <Text style={s.quickTitle}>{q.title}</Text>
            </Pressable>
          ))}
        </View>
        {items.length > 0 && (
          <>
            <View style={s.sectionRow}>
              <Text style={s.section}>Son eklenenler</Text>
              <Pressable onPress={() => router.push("/(tabs)/items")}>
                <Text style={s.link}>Tümünü gör →</Text>
              </Pressable>
            </View>
            <View>
              {items.slice(0, 3).map((i) => (
                <ItemRow key={i.id} item={i} reminders={reminders} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 38,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    fontSize: 35,
    fontWeight: "800",
    letterSpacing: -2,
    color: colors.ink[900],
  },
  settings: {
    padding: 11,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.ink[200],
  },
  eyebrow: {
    fontSize: 13,
    letterSpacing: 0,
    color: colors.ink[500],
    fontWeight: "400",
    marginTop: 20,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.8,
    color: colors.ink[900],
  },
  description: {
    fontSize: 13,
    color: colors.ink[500],
    lineHeight: 21,
    marginTop: 9,
    marginBottom: 24,
  },
  hero: {
    borderTopWidth: 2,
    borderBottomWidth: 1,
    borderColor: colors.ink[200],
    borderTopColor: colors.ink[900],
    paddingVertical: 22,
  },
  heroLabel: { fontSize: 14, color: colors.ink[600] },
  amount: {
    color: colors.ink[900],
    fontWeight: "600",
    fontSize: 42,
    fontVariant: ["tabular-nums"],
    marginTop: 16,
    letterSpacing: -1,
  },
  heroHint: { fontSize: 12, color: colors.ink[500], marginTop: 10 },
  metrics: { flexDirection: "row", gap: 12, marginTop: 12 },
  metric: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: colors.ink[200],
    paddingVertical: 14,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.ink[900],
    marginTop: 13,
  },
  metricLabel: { fontSize: 11, color: colors.ink[500], marginTop: 7 },
  section: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink[900],
    marginTop: 27,
    marginBottom: 15,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  link: { fontSize: 12, color: colors.brand[700] },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quick: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderColor: colors.ink[200],
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quickTitle: { fontSize: 14, fontWeight: "700", color: colors.ink[900] },
  error: {
    padding: 15,
    backgroundColor: colors.danger[50],
    borderRadius: 12,
    marginBottom: 15,
  },
});
