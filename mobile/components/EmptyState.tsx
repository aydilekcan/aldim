import { StyleSheet, Text, View } from "react-native";
import { colors, fontSize, radius, spacing } from "../lib/theme";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.desc}>{description}</Text>}
      {action && <View style={{ marginTop: spacing.lg }}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: spacing["3xl"],
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ink[200],
    borderStyle: "dashed",
    backgroundColor: colors.white,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.brand[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.ink[900],
    textAlign: "center",
  },
  desc: {
    fontSize: fontSize.sm,
    color: colors.ink[500],
    textAlign: "center",
    marginTop: 6,
    maxWidth: 320,
    lineHeight: 20,
  },
});
