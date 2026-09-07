import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Badge } from "./Badge";
import { CATEGORIES } from "../lib/categories";
import { daysUntil, formatDateTR, humanizeDaysLeft } from "../lib/date-utils";
import { colors, fontSize, radius, spacing } from "../lib/theme";
import type { Tone } from "../lib/theme";
import type { AldimItem, Reminder } from "../lib/types";

function toneFor(daysLeft: number): Tone {
  if (daysLeft < 0) return "neutral";
  if (daysLeft <= 7) return "warn";
  if (daysLeft <= 30) return "info";
  return "success";
}

/** Item için en yakın aktif hatırlatmayı bul */
function nextReminder(reminders: Reminder[], itemId: string): Reminder | null {
  const items = reminders
    .filter((r) => r.itemId === itemId && r.status === "active")
    .map((r) => ({ r, left: daysUntil(r.dueDate) }))
    .filter((x) => x.left >= 0)
    .sort((a, b) => a.left - b.left);
  return items[0]?.r ?? null;
}

/** Kategori-bazlı ikinci satır metni (marka/plaka/abone no vs.) */
function subtitle(item: AldimItem): string {
  if (item.category === "vehicle") {
    const plate = item.fields.plate;
    return typeof plate === "string" ? plate : item.title;
  }
  if (item.category === "home_bill") {
    const sub = item.fields.subscriberNumber;
    return [item.brand, typeof sub === "string" ? `Abone: ${sub}` : null]
      .filter(Boolean)
      .join(" · ");
  }
  if (item.category === "subscription") {
    return [item.brand, item.fields.packageName]
      .filter((x) => typeof x === "string" && x.length > 0)
      .join(" · ");
  }
  if (item.category === "insurance") {
    const policy = item.fields.policyNumber;
    return [item.brand, typeof policy === "string" ? `Poliçe ${policy}` : null]
      .filter(Boolean)
      .join(" · ");
  }
  const parts: string[] = [];
  if (item.brand) parts.push(item.brand);
  if (item.store) parts.push(item.store);
  return parts.join(" · ");
}

export function ItemRow({
  item,
  reminders,
}: {
  item: AldimItem;
  reminders: Reminder[];
}) {
  const router = useRouter();
  const spec = CATEGORIES[item.category];
  const next = nextReminder(reminders, item.id);
  const sub = subtitle(item);

  return (
    <Pressable
      onPress={() => router.push(`/item/${item.id}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name={spec.icon} size={20} color={colors.brand[700]} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Badge tone="neutral">{spec.label}</Badge>
          </View>
          {sub.length > 0 && (
            <Text style={styles.sub} numberOfLines={1}>
              {sub}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        {next ? (
          <View style={styles.nextRow}>
            <Badge tone={toneFor(daysUntil(next.dueDate))} dot>
              {humanizeDaysLeft(next.dueDate)}
            </Badge>
            <Text style={styles.subtle} numberOfLines={1}>
              {next.title} · {formatDateTR(next.dueDate)}
            </Text>
          </View>
        ) : (
          <Text style={styles.subtle}>Yaklaşan hatırlatma yok</Text>
        )}
        {item.documents.length > 0 && (
          <View style={styles.docs}>
            <Ionicons name="folder-outline" size={12} color={colors.ink[500]} />
            <Text style={styles.docsText}>{item.documents.length}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.ink[100],
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.ink[900],
  },
  sub: {
    fontSize: fontSize.sm,
    color: colors.ink[500],
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  nextRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minWidth: 0,
  },
  subtle: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.ink[500],
  },
  docs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.ink[50],
    borderRadius: radius.pill,
  },
  docsText: {
    fontSize: fontSize.xs,
    color: colors.ink[600],
    fontWeight: "600",
  },
});
