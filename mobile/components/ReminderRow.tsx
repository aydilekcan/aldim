import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSize, radius, spacing, tonePalette } from "../lib/theme";
import type { Tone } from "../lib/theme";
import { daysUntil, formatDateTR, humanizeDaysLeft } from "../lib/date-utils";
import type { Reminder, ReminderType } from "../lib/types";
import { Badge } from "./Badge";

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

const TYPE_ICON: Record<ReminderType, keyof typeof Ionicons.glyphMap> = {
  return_deadline: "return-down-back",
  warranty_end: "shield-checkmark-outline",
  extended_warranty_end: "shield-half-outline",
  service_follow_up: "build-outline",
  maintenance: "construct-outline",
  delivery: "cube-outline",
  installation: "hammer-outline",
  vehicle_inspection: "checkmark-circle-outline",
  exhaust_inspection: "leaf-outline",
  traffic_insurance: "car-outline",
  kasko: "umbrella-outline",
  mtv: "cash-outline",
  traffic_fine: "warning-outline",
  bill_due: "flash-outline",
  policy_end: "shield-half-outline",
  subscription_renewal: "play-circle-outline",
  commitment_end: "lock-closed-outline",
  generic_deadline: "alarm-outline",
};

function toneFor(daysLeft: number): Tone {
  if (daysLeft < 0) return "danger";
  if (daysLeft <= 7) return "warn";
  if (daysLeft <= 30) return "info";
  return "neutral";
}

function notificationSummary(reminder: Reminder): string {
  if (reminder.status === "completed") return "Tamamlandı";
  return reminder.notifyBeforeDays.map(d => d === 0 ? "Son gün" : `${d} gün önce`).join(" · ");
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
  const tone = toneFor(left);
  const palette = tonePalette[tone];

  const inner = (
    <>
      <View style={[styles.iconWrap, { backgroundColor: palette.bg }]}>
        <Ionicons name={TYPE_ICON[reminder.type]} size={20} color={palette.text} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {reminder.itemTitle || reminder.title}
          </Text>
          <Badge tone={tone} dot>
            {TYPE_LABEL[reminder.type]}
          </Badge>
        </View>
        <Text style={styles.meta}>
          {formatDateTR(reminder.dueDate)} · {humanizeDaysLeft(reminder.dueDate)}
        </Text>
        <View style={styles.notifLine}>
          <Ionicons
            name={
              reminder.status !== "completed"
                ? "notifications-outline"
                : "notifications-off-outline"
            }
            size={12}
            color={
              reminder.status !== "completed" ? colors.brand[700] : colors.ink[400]
            }
          />
          <Text
            style={[
              styles.notifText,
              reminder.notificationIds.length === 0 && { color: colors.ink[400] },
            ]}
          >
            {notificationSummary(reminder)}
          </Text>
        </View>
      </View>
    </>
  );

  if (disabled) {
    return <View style={styles.row}>{inner}</View>;
  }

  return (
    <Pressable
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
    alignItems: "flex-start",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.ink[100],
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
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
  meta: {
    fontSize: fontSize.xs,
    color: colors.ink[500],
    marginTop: 2,
  },
  notifLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  notifText: {
    fontSize: fontSize.xs,
    color: colors.brand[700],
    fontWeight: "500",
  },
});
