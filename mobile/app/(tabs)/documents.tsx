import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge } from "../../components/Badge";
import { EmptyState } from "../../components/EmptyState";
import { Header } from "../../components/Header";
import { formatDateTR } from "../../lib/date-utils";
import { useAldimStore } from "../../lib/store";
import { colors, fontSize, radius, spacing } from "../../lib/theme";
import type { AldimDocument, DocumentType } from "../../lib/types";

const TYPE_LABEL: Record<DocumentType, string> = {
  invoice: "Fatura",
  warranty: "Garanti",
  service_form: "Servis",
  shipping_receipt: "Kargo",
  policy: "Poliçe",
  registration: "Ruhsat",
  inspection: "Muayene",
  return_request: "İade",
  bill: "Fatura ödeme",
  other: "Diğer",
};

const FILTERS: { id: DocumentType | "all"; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "invoice", label: "Fatura" },
  { id: "warranty", label: "Garanti" },
  { id: "policy", label: "Poliçe" },
  { id: "registration", label: "Ruhsat" },
  { id: "inspection", label: "Muayene" },
  { id: "service_form", label: "Servis" },
  { id: "bill", label: "Fatura ödeme" },
  { id: "other", label: "Diğer" },
];

interface EnrichedDoc extends AldimDocument {
  parentTitle: string;
}

export default function DocumentsScreen() {
  const router = useRouter();
  const { items, hydrated } = useAldimStore();
  const [filter, setFilter] = useState<DocumentType | "all">("all");

  const docs: EnrichedDoc[] = useMemo(() => {
    const all = items.flatMap((i) =>
      i.documents.map((d) => ({ ...d, parentTitle: i.title })),
    );
    return all
      .filter((d) => (filter === "all" ? true : d.type === filter))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [items, filter]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Header
          title="Belge kasası"
          subtitle="Tüm faturalarına, poliçelerine ve belgelerine tek yerden ulaş."
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, paddingVertical: 4 }}
          style={{ marginBottom: spacing.lg }}
        >
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFilter(f.id)}
                style={[
                  styles.chip,
                  active && {
                    backgroundColor: colors.brand[700],
                    borderColor: colors.brand[700],
                  },
                ]}
              >
                <Text style={[styles.chipText, active && { color: colors.white }]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {!hydrated ? (
          <View style={styles.skeleton} />
        ) : docs.length === 0 ? (
          <EmptyState
            icon={<Ionicons name="folder-outline" size={28} color={colors.brand[700]} />}
            title="Henüz belge eklemedin"
            description="Bir kayıt detayına girip belge ekleyebilirsin."
          />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {docs.map((d) => (
              <Pressable
                key={d.id}
                onPress={() => router.push(`/document/${d.id}`)}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.92 }]}
              >
                {d.fileUri ? (
                  <Image source={{ uri: d.fileUri }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbEmpty]}>
                    <Ionicons name="document-outline" size={22} color={colors.brand[700]} />
                  </View>
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.name} numberOfLines={1}>
                    {d.name}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {d.parentTitle} · {formatDateTR(d.date)}
                  </Text>
                </View>
                <Badge tone="info">{TYPE_LABEL[d.type]}</Badge>
              </Pressable>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ink[100],
    padding: spacing.md,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.ink[100],
  },
  thumbEmpty: {
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.ink[900],
  },
  meta: {
    fontSize: fontSize.xs,
    color: colors.ink[500],
    marginTop: 2,
  },
  skeleton: {
    height: 80,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ink[100],
  },
});
