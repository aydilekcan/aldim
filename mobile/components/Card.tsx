import { StyleSheet, View, Text, Pressable } from "react-native";
import type { ViewProps, PressableProps } from "react-native";
import { colors, radius, spacing, fontSize } from "../lib/theme";

export function Card({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[styles.card, style]} />;
}

export function PressableCard({ style, ...rest }: PressableProps) {
  return (
    <Pressable
      {...rest}
      style={(state) => [
        styles.card,
        { opacity: state.pressed ? 0.9 : 1 },
        typeof style === "function" ? style(state) : style,
      ]}
    />
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function CardDescription({ children }: { children: React.ReactNode }) {
  return <Text style={styles.desc}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ink[100],
    padding: spacing.lg,
    shadowColor: colors.ink[900],
    shadowOpacity: 0,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 0,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.ink[900],
  },
  desc: {
    fontSize: fontSize.sm,
    color: colors.ink[500],
    marginTop: 2,
  },
});
