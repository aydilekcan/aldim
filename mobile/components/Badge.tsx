import { StyleSheet, Text, View } from "react-native";
import { tonePalette, radius, spacing, fontSize } from "../lib/theme";
import type { Tone } from "../lib/theme";

export function Badge({
  children,
  tone = "neutral",
  dot,
}: {
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
}) {
  const palette = tonePalette[tone];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: palette.bg, borderColor: palette.border },
      ]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: palette.dot }]} />}
      <Text style={[styles.text, { color: palette.text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
});
