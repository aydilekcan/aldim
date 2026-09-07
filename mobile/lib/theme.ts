// Aldım renk paleti — sade, güven veren mobil tema.
// Web projesindeki marka tonlarıyla aynı ailede.
export const colors = {
  brand: {
    50: "#f5eee7",
    100: "#eeddd0",
    200: "#d6ae98",
    500: "#b97557",
    700: "#b74e30",
    800: "#8f3d27",
    900: "#65321f",
  },
  accent: {
    50: "#edf4ef",
    100: "#dae8dc",
    500: "#527e5d",
    600: "#40664b",
    700: "#34573e",
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
    50: "#f7f5f0",
    100: "#eee9e1",
    200: "#ded8cf",
    300: "#c9c1b6",
    400: "#999086",
    500: "#736d65",
    600: "#625b53",
    700: "#514a42",
    800: "#39342f",
    900: "#272522",
  },
  white: "#FFFFFF",
} as const;

export const radius = {
  sm: 5,
  md: 7,
  lg: 9,
  xl: 12,
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
