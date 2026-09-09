import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSize, spacing, tonePalette } from "../lib/theme";
import type { Tone } from "../lib/theme";
import { daysUntil, formatDateTR, humanizeDaysLeft } from "../lib/date-utils";
import type { Reminder, ReminderType } from "../lib/types";

const TYPE_LABEL: Record<ReminderType, string> = {
  return_deadline: "İade",
  warranty_end: "Garanti",
  extended_warranty_end: "Ek garanti",
  service_follow_up: "Servis",
  maintenance: "Bakım",
  delivery: "Teslimat",
  installation: "Montaj",
  vehicle_inspection: "Muayene",
  exhaust_inspection: "Egzoz",
  traffic_insurance: "Trafik sig.",
  kasko: "Kasko",
  mtv: "MTV",
  traffic_fine: "Ceza",
  bill_due: "Fatura",
  policy_end: "Poliçe",
  subscription_renewal: "Abonelik",
  commitment_end: "Taahhüt",
  generic_deadline: "Son tarih",
};

function toneFor(daysLeft: number): Tone {
  if (daysLeft < 0) return "danger";
  if (daysLeft <= 7) return "warn";
  if (daysLeft <= 30) return "info";
  return "neutral";
}

export function ReminderRow({
  reminder,
  disabled,
}: {
  reminder: Reminder;
  /**
   * true ise satır salt-okunur bilgi olarak render edilir.
   * Detay sayfası gibi zaten o item'ın içinde olunan ekranlarda kullan —
   * aynı /item/[id] route'una self-navigation'ı engeller.
   */
  disabled?: boolean;
}) {
  const router = useRouter();
  const left = daysUntil(reminder.dueDate);
  const tone = reminder.status === "completed" ? "neutral" : toneFor(left);
  const [dateDay, dateMonth] = formatDateTR(reminder.dueDate).split(" ");
  const palette = tonePalette[tone];

  const inner = (
    <>
      <View
        accessibilityLabel={formatDateTR(reminder.dueDate)}
        style={[styles.dateBlock, { borderLeftColor: palette.text }]}
      >
        <Text style={styles.dateDay}>{dateDay}</Text>
        <Text style={styles.dateMonth}>{dateMonth}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {reminder.itemTitle || reminder.title}
          </Text>
        </View>
        <Text style={styles.meta}>
          {TYPE_LABEL[reminder.type]} · {reminder.dueDate.slice(0, 4)}
        </Text>
        <Text style={[styles.status, { color: palette.text }]}>
          {reminder.status === "completed"
            ? "Tamamlandı"
            : humanizeDaysLeft(reminder.dueDate)}
        </Text>
      </View>
      {!disabled && (
        <Ionicons name="chevron-forward" size={16} color={colors.ink[400]} />
      )}
    </>
  );

  if (disabled) {
    return <View style={styles.row}>{inner}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/item/${reminder.itemId}`)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.92 }]}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.ink[200],
    paddingVertical: 16,
  },
  dateBlock: { width: 58, borderLeftWidth: 2, paddingLeft: 12, gap: 2 },
  dateDay: {
    fontSize: 25,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
    color: colors.ink[900],
  },
  dateMonth: { fontSize: 11, color: colors.ink[500] },
  titleRow: { flexDirection: "row", alignItems: "center" },
  title: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.ink[900],
  },
  meta: { fontSize: 12, color: colors.ink[500], marginTop: 5 },
  status: { fontSize: 12, fontWeight: "600", marginTop: 7 },
});
