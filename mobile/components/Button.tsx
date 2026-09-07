import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import type { PressableProps } from "react-native";
import { colors, radius, spacing, fontSize } from "../lib/theme";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";

interface Props extends Omit<PressableProps, "style"> {
  title: string;
  variant?: Variant;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const VARIANT_STYLE = {
  primary: {
    bg: colors.ink[900],
    text: colors.white,
    border: colors.ink[900],
  },
  secondary: {
    bg: colors.accent[500],
    text: colors.white,
    border: colors.accent[500],
  },
  ghost: { bg: "transparent", text: colors.ink[800], border: "transparent" },
  outline: { bg: colors.white, text: colors.ink[800], border: colors.ink[200] },
  danger: {
    bg: colors.danger[500],
    text: colors.white,
    border: colors.danger[500],
  },
} as const;

const SIZE_STYLE = {
  sm: { height: 38, padX: spacing.md, font: fontSize.sm },
  md: { height: 48, padX: spacing.lg, font: fontSize.base },
  lg: { height: 54, padX: spacing.xl, font: fontSize.md },
} as const;

export function Button({
  title,
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  disabled,
  leftIcon,
  rightIcon,
  ...rest
}: Props) {
  const v = VARIANT_STYLE[variant];
  const s = SIZE_STYLE[size];
  return (
    <Pressable
      {...rest}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          height: s.height,
          paddingHorizontal: s.padX,
          opacity: disabled || loading ? 0.5 : pressed ? 0.85 : 1,
          width: fullWidth ? "100%" : undefined,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <View style={styles.content}>
          {leftIcon}
          <Text style={[styles.text, { color: v.text, fontSize: s.font }]}>
            {title}
          </Text>
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  text: {
    fontWeight: "600",
  },
});
