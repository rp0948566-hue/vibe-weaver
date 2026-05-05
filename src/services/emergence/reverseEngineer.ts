import { supabase } from "@/integrations/supabase/client";

export interface DesignDNA {
  url: string;
  title: string;
  palette: string[];
  fonts: string[];
  layout: string;
  mood: string;
  components: string[];
  promptSuggestion: string;
}

// Heuristic analysis — works purely from URL structure and meta when fetch is blocked by CORS.
// The edge function path handles the actual fetch server-side when available.
export async function reverseEngineerUrl(
  url: string,
  userId: string | null,
): Promise<DesignDNA> {
  // Check DB cache first
  if (userId) {
    const { data } = await supabase
      .from("design_dna")
      .select("title, dna")
      .eq("user_id", userId)
      .eq("url", url)
      .maybeSingle();
    if (data) {
      const dna = data.dna as Record<string, unknown>;
      return {
        url,
        title: data.title ?? "",
        palette: (dna.palette as string[]) ?? [],
        fonts: (dna.fonts as string[]) ?? [],
        layout: (dna.layout as string) ?? "",
        mood: (dna.mood as string) ?? "",
        components: (dna.components as string[]) ?? [],
        promptSuggestion: (dna.promptSuggestion as string) ?? "",
      };
    }
  }

  // Try server-side fetch via Supabase edge function
  try {
    const { data: fnData, error } = await supabase.functions.invoke(
      "reverse-engineer",
      { body: { url } },
    );
    if (!error && fnData) {
      const result = fnData as DesignDNA;
      if (userId) {
        await supabase.from("design_dna").insert({
          user_id: userId,
          url,
          title: result.title,
          dna: {
            palette: result.palette,
            fonts: result.fonts,
            layout: result.layout,
            mood: result.mood,
            components: result.components,
            promptSuggestion: result.promptSuggestion,
          },
        });
      }
      return result;
    }
  } catch {
    // edge function not deployed — fall through to heuristic
  }

  // Heuristic fallback: derive design DNA from URL structure
  return heuristicDNA(url);
}

function heuristicDNA(url: string): DesignDNA {
  const lower = url.toLowerCase();
  const host = (() => {
    try { return new URL(url).hostname; } catch { return url; }
  })();

  // Detect broad category from hostname keywords
  const isDark = /figma|vercel|linear|github|notion|raycast|arc/.test(host);
  const isLuxury = /luxury|premium|apple|rolex|ferrari|tesla/.test(host);
  const isMinimal = /stripe|linear|loom|craft|notion/.test(host);
  const isColorful = /dribbble|behance|spotify|netflix/.test(host);
  const isTech = /github|vercel|supabase|fly|cloudflare|aws/.test(host);

  const palette = isDark
    ? ["#09090b", "#18181b", "#a1a1aa", "#ffffff", "#6366f1"]
    : isLuxury
      ? ["#0a0a0a", "#c9a96e", "#f5f0e8", "#1a1a2e", "#c8b89a"]
      : isColorful
        ? ["#ea4c89", "#1769ff", "#ff7c00", "#00c3ff", "#ffffff"]
        : ["#ffffff", "#f4f4f5", "#18181b", "#3b82f6", "#6366f1"];

  const fonts = isLuxury
    ? ["Playfair Display", "Cormorant Garamond"]
    : isMinimal
      ? ["Inter", "Plus Jakarta Sans"]
      : isTech
        ? ["Geist", "JetBrains Mono"]
        : ["Inter", "Instrument Serif"];

  const layout = /landing|home|\.io$|\.com$/.test(lower)
    ? "full-width sections, large hero, sticky nav"
    : /dashboard|app|admin/.test(lower)
      ? "sidebar + main content area, compact density"
      : "centered content, generous whitespace";

  const mood = isDark
    ? "professional dark, high contrast"
    : isLuxury
      ? "opulent, editorial, warm gold tones"
      : isColorful
        ? "vibrant, energetic, brand-forward"
        : isMinimal
          ? "ultra-clean, minimal, focused"
          : "modern, neutral, approachable";

  const components = isDark
    ? ["navbar", "hero", "cards", "button", "footer"]
    : isLuxury
      ? ["hero", "editorial-grid", "pricing", "testimonials"]
      : ["navbar", "hero", "features", "cards", "cta", "footer"];

  const promptSuggestion =
    `Build a ${mood} UI inspired by ${host}. ` +
    `Use palette ${palette.slice(0, 3).join(", ")}. ` +
    `Typography: ${fonts[0]}. Layout: ${layout}. ` +
    `Include: ${components.join(", ")}.`;

  return {
    url,
    title: host,
    palette,
    fonts,
    layout,
    mood,
    components,
    promptSuggestion,
  };
}
