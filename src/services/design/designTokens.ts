const LS_BRAND = "raincast_brand_tokens";

export interface BrandTokens {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
    error: string;
    success: string;
  };
  typography: {
    displayFont: string;
    bodyFont: string;
    monoFont: string;
    scaleBase: number;
  };
  spacing: { unit: 4 | 8; scale: number[] };
  radius: { sm: number; md: number; lg: number; full: number };
  shadows: { sm: string; md: string; lg: string };
  aesthetic: string;
}

export const DEFAULT_BRAND: BrandTokens = {
  name: "Default",
  colors: {
    primary: "#6366f1",
    secondary: "#818cf8",
    background: "#0a0a0f",
    surface: "#12121a",
    text: "#f1f5f9",
    accent: "#a78bfa",
    error: "#ef4444",
    success: "#22c55e",
  },
  typography: {
    displayFont: "Instrument Serif",
    bodyFont: "Inter",
    monoFont: "JetBrains Mono",
    scaleBase: 16,
  },
  spacing: { unit: 8, scale: [4, 8, 12, 16, 24, 32, 48, 64, 96] },
  radius: { sm: 4, md: 8, lg: 16, full: 9999 },
  shadows: {
    sm: "0 1px 3px rgba(0,0,0,0.4)",
    md: "0 4px 12px rgba(0,0,0,0.5)",
    lg: "0 12px 40px rgba(0,0,0,0.6)",
  },
  aesthetic: "minimal",
};

export const AESTHETICS = ["minimal", "luxury", "bold", "playful", "dark", "corporate", "editorial"] as const;

export function saveBrandTokens(tokens: BrandTokens): void {
  try { localStorage.setItem(LS_BRAND, JSON.stringify(tokens)); } catch { /* ignore */ }
}

export function loadBrandTokens(): BrandTokens | null {
  try {
    const raw = localStorage.getItem(LS_BRAND);
    if (!raw) return null;
    return JSON.parse(raw) as BrandTokens;
  } catch { return null; }
}

export function buildBrandContext(brand: BrandTokens): string {
  return `BRAND DESIGN SYSTEM — ALWAYS USE THESE:
Brand: ${brand.name}
Aesthetic: ${brand.aesthetic}
Primary: ${brand.colors.primary}
Secondary: ${brand.colors.secondary}
Background: ${brand.colors.background}
Surface: ${brand.colors.surface}
Text: ${brand.colors.text}
Accent: ${brand.colors.accent}
Display Font: ${brand.typography.displayFont}
Body Font: ${brand.typography.bodyFont}
Border Radius: sm=${brand.radius.sm}px md=${brand.radius.md}px lg=${brand.radius.lg}px full=${brand.radius.full}px
Spacing Unit: ${brand.spacing.unit}px
Shadows: sm="${brand.shadows.sm}" md="${brand.shadows.md}"

Apply this design system to EVERY component generated.
Never deviate from these values unless user explicitly asks.`;
}
