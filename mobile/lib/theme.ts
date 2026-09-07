// Aldım renk paleti — sade, güven veren mobil tema.
// Web projesindeki marka tonlarıyla aynı ailede.
export const colors = {
  brand: {
    50: "#EDF3E9",
    100: "#DCE8D3",
    200: "#B8D3AF",
    500: "#508C72",
    700: "#246F5C",
    800: "#214D40",
    900: "#18392F",
  },
  accent: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    500: "#10B981",
    600: "#059669",
    700: "#047857",
  },
  warn: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    500: "#F97316",
    600: "#EA580C",
  },
  danger: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    500: "#EF4444",
    600: "#DC2626",
  },
  ink: {
    50: "#F6F7F2",
    100: "#EFF2E9",
    200: "#E3E8DC",
    300: "#CCD7C1",
    400: "#93A18A",
    500: "#72836A",
    600: "#53694B",
    700: "#3F5738",
    800: "#2B4332",
    900: "#203B37",
  },
  white: "#FFFFFF",
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  "2xl": 28,
} as const;

export type Tone = "neutral" | "success" | "warn" | "danger" | "info";

export const tonePalette: Record<
  Tone,
  { bg: string; border: string; text: string; dot: string }
> = {
  neutral: {
    bg: colors.ink[100],
    border: colors.ink[200],
    text: colors.ink[700],
    dot: colors.ink[400],
  },
  success: {
    bg: colors.accent[50],
    border: colors.accent[100],
    text: colors.accent[700],
    dot: colors.accent[500],
  },
  warn: {
    bg: colors.warn[50],
    border: colors.warn[100],
    text: colors.warn[600],
    dot: colors.warn[500],
  },
  danger: {
    bg: colors.danger[50],
    border: colors.danger[100],
    text: colors.danger[600],
    dot: colors.danger[500],
  },
  info: {
    bg: colors.brand[50],
    border: colors.brand[100],
    text: colors.brand[700],
    dot: colors.brand[500],
  },
};
