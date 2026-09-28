import { Easing } from "remotion";

// Mirrors apps/mobile/src/context/ThemeContext.tsx (light theme + accent colors)
export const app = {
  bgPrimary: "#f8fafc",
  bgSecondary: "#ffffff",
  bgTertiary: "#f1f5f9",
  bgQuaternary: "#e2e8f0",
  textPrimary: "#0f172a",
  textSecondary: "#334155",
  textMuted: "#64748b",
  textDisabled: "#94a3b8",
  borderColor: "#e2e8f0",
  borderStrong: "#cbd5e1",
  cardBg: "#ffffff",
} as const;

export const accent = {
  blue: "#3b82f6",
  blueHover: "#2563eb",
  orange: "#e8742a",
  yellow: "#facc15",
  green: "#22c55e",
  red: "#ef4444",
} as const;

// Promo-only palette, derived from apps/mobile/assets/images/feature-graphic.png
export const promo = {
  navy: "#0f172a",
  navyDeep: "#060a14",
  ink: "#f8fafc",
  inkMuted: "rgba(226,232,240,0.72)",
  blueGlow: "rgba(59,130,246,0.55)",
  orangeGlow: "rgba(232,116,42,0.45)",
} as const;

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_CAMERA = Easing.bezier(0.7, 0, 0.2, 1);
export const EASE_BACK = Easing.bezier(0.34, 1.56, 0.64, 1);
