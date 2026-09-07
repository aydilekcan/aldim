import { StyleSheet, Text, View } from "react-native";
import { colors, fontSize, spacing } from "../lib/theme";

export function Header({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize["2xl"],
    fontWeight: "700",
    color: colors.ink[900],
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.ink[500],
    marginTop: 4,
    lineHeight: 20,
  },
});
