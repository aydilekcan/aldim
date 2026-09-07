import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CATEGORIES, CATEGORY_ORDER } from "../lib/categories";
import { colors, fontSize, radius, spacing } from "../lib/theme";
import type { ItemCategory } from "../lib/types";

export function CategoryPicker({
  onSelect,
}: {
  onSelect: (c: ItemCategory) => void;
}) {
  return (
    <View style={styles.grid}>
      {CATEGORY_ORDER.map((c) => {
        const spec = CATEGORIES[c];
        return (
          <Pressable
            key={c}
            onPress={() => onSelect(c)}
            style={({ pressed }) => [
              styles.card,
              pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
            ]}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={spec.icon} size={24} color={colors.brand[700]} />
            </View>
            <Text style={styles.label}>{spec.label}</Text>
            <Text style={styles.desc} numberOfLines={2}>
              {spec.description}
            </Text>
            <Text style={styles.examples} numberOfLines={2}>
              {spec.examples}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.ink[100],
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
    minHeight: 158,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: "700",
    color: colors.ink[900],
  },
  desc: {
    fontSize: fontSize.xs,
    color: colors.ink[600],
    lineHeight: 16,
    fontWeight: "500",
  },
  examples: {
    fontSize: fontSize.xs,
    color: colors.ink[400],
    lineHeight: 16,
    marginTop: 2,
  },
});
