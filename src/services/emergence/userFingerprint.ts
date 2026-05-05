import { supabase } from "@/integrations/supabase/client";
import type { BuildMemory } from "./buildMemory";

export interface StyleFingerprint {
  dominantComponents: string[];
  dominantStyles: string[];
  colorSignature: string[];
  animationPreference: "none" | "subtle" | "rich";
  complexityLevel: "minimal" | "moderate" | "rich";
  themePreference: "light" | "dark" | "neutral";
  totalBuilds: number;
}

export function computeFingerprint(builds: BuildMemory[]): StyleFingerprint {
  if (builds.length === 0) {
    return {
      dominantComponents: [],
      dominantStyles: [],
      colorSignature: [],
      animationPreference: "subtle",
      complexityLevel: "moderate",
      themePreference: "neutral",
      totalBuilds: 0,
    };
  }

  const compFreq: Record<string, number> = {};
  const styleFreq: Record<string, number> = {};
  const colorFreq: Record<string, number> = {};

  for (const b of builds) {
    for (const c of b.componentTypes) compFreq[c] = (compFreq[c] ?? 0) + 1;
    for (const s of b.styleTags) styleFreq[s] = (styleFreq[s] ?? 0) + 1;
    for (const c of b.colorPalette) colorFreq[c] = (colorFreq[c] ?? 0) + 1;
  }

  const topN = (freq: Record<string, number>, n: number) =>
    Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k]) => k);

  const dominantStyles = topN(styleFreq, 6);

  const animationScore = (styleFreq["animated"] ?? 0) + (styleFreq["parallax"] ?? 0);
  const animationPreference =
    animationScore > builds.length * 0.6
      ? "rich"
      : animationScore > builds.length * 0.2
        ? "subtle"
        : "none";

  const richCount = (compFreq["dashboard"] ?? 0) + (compFreq["cards"] ?? 0) * 0.5;
  const minimalCount = (styleFreq["minimal"] ?? 0);
  const complexityLevel =
    richCount > builds.length * 0.5
      ? "rich"
      : minimalCount > builds.length * 0.4
        ? "minimal"
        : "moderate";

  const darkCount = styleFreq["dark-theme"] ?? 0;
  const themePreference =
    darkCount > builds.length * 0.5 ? "dark" : darkCount < builds.length * 0.2 ? "light" : "neutral";

  return {
    dominantComponents: topN(compFreq, 5),
    dominantStyles,
    colorSignature: topN(colorFreq, 5),
    animationPreference,
    complexityLevel,
    themePreference,
    totalBuilds: builds.length,
  };
}

export async function loadFingerprint(userId: string): Promise<StyleFingerprint | null> {
  const { data, error } = await supabase
    .from("user_fingerprints")
    .select("preferred_styles, total_builds")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  const s = data.preferred_styles as Record<string, unknown>;
  return {
    dominantComponents: (s.dominantComponents as string[]) ?? [],
    dominantStyles: (s.dominantStyles as string[]) ?? [],
    colorSignature: (s.colorSignature as string[]) ?? [],
    animationPreference: (s.animationPreference as StyleFingerprint["animationPreference"]) ?? "subtle",
    complexityLevel: (s.complexityLevel as StyleFingerprint["complexityLevel"]) ?? "moderate",
    themePreference: (s.themePreference as StyleFingerprint["themePreference"]) ?? "neutral",
    totalBuilds: data.total_builds ?? 0,
  };
}

export async function persistFingerprint(
  userId: string,
  fp: StyleFingerprint,
): Promise<void> {
  const { error } = await supabase
    .from("user_fingerprints")
    .upsert(
      {
        user_id: userId,
        preferred_styles: fp as unknown as Record<string, unknown>,
        total_builds: fp.totalBuilds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  if (error) console.warn("emergence: persistFingerprint", error.message);
}
