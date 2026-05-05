/**
 * designMdLoader.ts
 * Lazy-loads a brand DESIGN.md from /public/design-md/{slug}/DESIGN.md
 * and formats it for injection into the AI build pipeline.
 */

// Cache loaded brand contexts in memory for the session
const cache = new Map<string, string>();

export interface BrandInfo {
  slug: string;
  name: string;
  category: string;
  primaryColor: string;
  style: string; // e.g. "dark" | "light" | "minimal"
}

export const BRAND_CATALOG: BrandInfo[] = [
  // Own brand (from brand-master folder)
  { slug: "asyncapi", name: "AsyncAPI", category: "Open Source", primaryColor: "#875AE2", style: "light" },
  // AI / LLM
  { slug: "claude", name: "Claude", category: "AI", primaryColor: "#d97757", style: "dark" },
  { slug: "mistral.ai", name: "Mistral AI", category: "AI", primaryColor: "#ff7000", style: "dark" },
  { slug: "elevenlabs", name: "ElevenLabs", category: "AI", primaryColor: "#f5a623", style: "dark" },
  { slug: "ollama", name: "Ollama", category: "AI", primaryColor: "#ffffff", style: "dark" },
  { slug: "cohere", name: "Cohere", category: "AI", primaryColor: "#39d353", style: "light" },
  { slug: "replicate", name: "Replicate", category: "AI", primaryColor: "#000000", style: "dark" },
  { slug: "runwayml", name: "RunwayML", category: "AI", primaryColor: "#5b5fe8", style: "dark" },
  { slug: "together.ai", name: "Together AI", category: "AI", primaryColor: "#7c3aed", style: "dark" },
  { slug: "minimax", name: "MiniMax", category: "AI", primaryColor: "#6366f1", style: "dark" },
  { slug: "x.ai", name: "xAI / Grok", category: "AI", primaryColor: "#ffffff", style: "dark" },
  // Dev Tools
  { slug: "vercel", name: "Vercel", category: "Dev Tools", primaryColor: "#ffffff", style: "dark" },
  { slug: "cursor", name: "Cursor", category: "Dev Tools", primaryColor: "#8b5cf6", style: "dark" },
  { slug: "supabase", name: "Supabase", category: "Dev Tools", primaryColor: "#3ecf8e", style: "dark" },
  { slug: "linear.app", name: "Linear", category: "Dev Tools", primaryColor: "#5e6ad2", style: "dark" },
  { slug: "raycast", name: "Raycast", category: "Dev Tools", primaryColor: "#ff6363", style: "dark" },
  { slug: "warp", name: "Warp", category: "Dev Tools", primaryColor: "#01c2c2", style: "dark" },
  { slug: "resend", name: "Resend", category: "Dev Tools", primaryColor: "#000000", style: "light" },
  { slug: "sentry", name: "Sentry", category: "Dev Tools", primaryColor: "#6c5fc7", style: "dark" },
  { slug: "posthog", name: "PostHog", category: "Dev Tools", primaryColor: "#f54e00", style: "light" },
  { slug: "hashicorp", name: "HashiCorp", category: "Dev Tools", primaryColor: "#000ec9", style: "light" },
  { slug: "clickhouse", name: "ClickHouse", category: "Dev Tools", primaryColor: "#faff69", style: "dark" },
  { slug: "expo", name: "Expo", category: "Dev Tools", primaryColor: "#4630eb", style: "dark" },
  // Fintech
  { slug: "stripe", name: "Stripe", category: "Fintech", primaryColor: "#635bff", style: "light" },
  { slug: "coinbase", name: "Coinbase", category: "Fintech", primaryColor: "#0052ff", style: "light" },
  { slug: "revolut", name: "Revolut", category: "Fintech", primaryColor: "#0075eb", style: "dark" },
  { slug: "binance", name: "Binance", category: "Fintech", primaryColor: "#f0b90b", style: "dark" },
  { slug: "kraken", name: "Kraken", category: "Fintech", primaryColor: "#5741d9", style: "dark" },
  { slug: "wise", name: "Wise", category: "Fintech", primaryColor: "#9fe870", style: "light" },
  { slug: "mastercard", name: "Mastercard", category: "Fintech", primaryColor: "#eb001b", style: "light" },
  { slug: "uber", name: "Uber", category: "Fintech", primaryColor: "#000000", style: "light" },
  // Automotive
  { slug: "tesla", name: "Tesla", category: "Automotive", primaryColor: "#e82127", style: "dark" },
  { slug: "ferrari", name: "Ferrari", category: "Automotive", primaryColor: "#dc0000", style: "dark" },
  { slug: "lamborghini", name: "Lamborghini", category: "Automotive", primaryColor: "#f5a800", style: "dark" },
  { slug: "bugatti", name: "Bugatti", category: "Automotive", primaryColor: "#1c4aad", style: "dark" },
  { slug: "bmw", name: "BMW", category: "Automotive", primaryColor: "#1c69d4", style: "light" },
  { slug: "bmw-m", name: "BMW M", category: "Automotive", primaryColor: "#e32219", style: "dark" },
  { slug: "renault", name: "Renault", category: "Automotive", primaryColor: "#efdf00", style: "light" },
  // Consumer
  { slug: "apple", name: "Apple", category: "Consumer", primaryColor: "#0066cc", style: "light" },
  { slug: "nike", name: "Nike", category: "Consumer", primaryColor: "#000000", style: "light" },
  { slug: "spotify", name: "Spotify", category: "Consumer", primaryColor: "#1ed760", style: "dark" },
  { slug: "starbucks", name: "Starbucks", category: "Consumer", primaryColor: "#00704a", style: "light" },
  { slug: "shopify", name: "Shopify", category: "Consumer", primaryColor: "#96bf48", style: "light" },
  { slug: "airbnb", name: "Airbnb", category: "Consumer", primaryColor: "#ff385c", style: "light" },
  { slug: "pinterest", name: "Pinterest", category: "Consumer", primaryColor: "#e60023", style: "light" },
  // Productivity
  { slug: "notion", name: "Notion", category: "Productivity", primaryColor: "#5645d4", style: "light" },
  { slug: "figma", name: "Figma", category: "Productivity", primaryColor: "#f24e1e", style: "light" },
  { slug: "miro", name: "Miro", category: "Productivity", primaryColor: "#ffdd00", style: "light" },
  { slug: "airtable", name: "Airtable", category: "Productivity", primaryColor: "#fcb400", style: "light" },
  { slug: "framer", name: "Framer", category: "Productivity", primaryColor: "#0099ff", style: "dark" },
  { slug: "cal", name: "Cal.com", category: "Productivity", primaryColor: "#111827", style: "light" },
  { slug: "webflow", name: "Webflow", category: "Productivity", primaryColor: "#146ef5", style: "dark" },
  { slug: "intercom", name: "Intercom", category: "Productivity", primaryColor: "#1f8ded", style: "light" },
  { slug: "superhuman", name: "Superhuman", category: "Productivity", primaryColor: "#f97316", style: "dark" },
  // Media
  { slug: "theverge", name: "The Verge", category: "Media", primaryColor: "#ff3b30", style: "light" },
  { slug: "wired", name: "Wired", category: "Media", primaryColor: "#000000", style: "light" },
  // Gaming
  { slug: "playstation", name: "PlayStation", category: "Gaming", primaryColor: "#003087", style: "dark" },
  { slug: "spacex", name: "SpaceX", category: "Gaming", primaryColor: "#005288", style: "dark" },
  // Enterprise
  { slug: "ibm", name: "IBM", category: "Enterprise", primaryColor: "#0f62fe", style: "light" },
  { slug: "mongodb", name: "MongoDB", category: "Enterprise", primaryColor: "#00ed64", style: "dark" },
  { slug: "sanity", name: "Sanity", category: "Enterprise", primaryColor: "#f03e2f", style: "light" },
  { slug: "mintlify", name: "Mintlify", category: "Enterprise", primaryColor: "#7c3aed", style: "dark" },
  { slug: "clay", name: "Clay", category: "Enterprise", primaryColor: "#ff6b35", style: "light" },
  { slug: "composio", name: "Composio", category: "Enterprise", primaryColor: "#6366f1", style: "dark" },
  { slug: "vodafone", name: "Vodafone", category: "Enterprise", primaryColor: "#e60000", style: "light" },
  { slug: "meta", name: "Meta", category: "Enterprise", primaryColor: "#0082fb", style: "light" },
  { slug: "lovable", name: "Lovable", category: "Enterprise", primaryColor: "#ff5757", style: "dark" },
  { slug: "opencode.ai", name: "Opencode AI", category: "Enterprise", primaryColor: "#22c55e", style: "dark" },
  { slug: "voltagent", name: "VoltAgent", category: "Enterprise", primaryColor: "#f59e0b", style: "dark" },
  { slug: "nvidia", name: "NVIDIA", category: "Enterprise", primaryColor: "#76b900", style: "dark" },
];

/**
 * Load a brand's DESIGN.md content, using in-memory cache.
 */
export async function loadBrandDesignMd(slug: string): Promise<string | null> {
  if (cache.has(slug)) return cache.get(slug)!;
  try {
    const res = await fetch(`/design-md/${slug}/DESIGN.md`);
    if (!res.ok) return null;
    const text = await res.text();
    cache.set(slug, text);
    return text;
  } catch {
    return null;
  }
}

/**
 * Extract a named section from DESIGN.md by heading number or name.
 * Returns everything from the heading until the next same-level heading.
 */
function extractSection(content: string, heading: string): string {
  const lines = content.split("\n");
  let inSection = false;
  const sectionLines: string[] = [];
  for (const line of lines) {
    if (!inSection) {
      if (line.match(new RegExp(`^##\\s+\\d*\\.?\\s*${heading}`, "i"))) {
        inSection = true;
        sectionLines.push(line);
      }
    } else {
      if (line.match(/^##\s+\d/) && !line.match(new RegExp(`^##\\s+\\d*\\.?\\s*${heading}`, "i"))) break;
      sectionLines.push(line);
    }
  }
  return sectionLines.join("\n").trim();
}

/**
 * Build the injection message for the AI pipeline.
 * Extracts Section 9 (Agent Prompt Guide) as the primary directive, then includes full DESIGN.md.
 */
export function buildBrandInjectionMessage(slug: string, designMdContent: string): string {
  const brand = BRAND_CATALOG.find((b) => b.slug === slug);
  const name = brand?.name ?? slug;

  // Extract the most actionable sections first
  const agentGuide = extractSection(designMdContent, "Agent Prompt Guide");
  const dosDonts = extractSection(designMdContent, "Do");
  const colorSection = extractSection(designMdContent, "Color");
  const typographySection = extractSection(designMdContent, "Typography");
  const componentSection = extractSection(designMdContent, "Component");

  // Concrete CSS variable block from BRAND_CATALOG token
  const mode = brand?.style === "dark" ? "dark" : "light";
  const accent = brand?.primaryColor ?? "#6366f1";
  const canvas = mode === "dark" ? "#0a0a0f" : "#fafafa";
  const cssVars = `/* ── ${name} CSS Variables — inject into :root ── */
:root {
  --brand-canvas: ${canvas};
  --brand-accent: ${accent};
  --brand-mode: ${mode};
}`;

  return `<<BRAND_STYLE_SYSTEM: ${name.toUpperCase()}>>

⚠ BRAND OVERRIDE ACTIVE — the rules below REPLACE all generic design defaults. ⚠

You are building a PIXEL-PERFECT implementation of the ${name} design system.
NOT inspired by. NOT "similar to". EXACTLY like ${name}.

MANDATORY CSS starter:
\`\`\`
${cssVars}
\`\`\`

━━ PRIORITY 1 — AGENT QUICK REFERENCE (implement these FIRST) ━━
${agentGuide || "See full design system below."}

━━ PRIORITY 2 — DO'S AND DON'TS (violations = failed build) ━━
${dosDonts || ""}

━━ PRIORITY 3 — FULL COLOR PALETTE ━━
${colorSection || ""}

━━ PRIORITY 4 — TYPOGRAPHY RULES ━━
${typographySection || ""}

━━ PRIORITY 5 — COMPONENT SPECS ━━
${componentSection || ""}

━━ FULL DESIGN SYSTEM REFERENCE ━━
${designMdContent}

<<END_BRAND_STYLE_SYSTEM>>

IMPLEMENTATION CHECKLIST — every item must be true before outputting code:
□ Background color matches ${name}'s exact canvas hex (NOT #0a0a0f unless that's their canvas)
□ Accent/primary color is exactly ${accent}
□ Font family matches ${name}'s documented font (load from Google Fonts if needed)
□ Border radius follows ${name}'s documented scale
□ Shadows use ${name}'s documented shadow formula
□ Navigation matches ${name}'s documented nav component exactly
□ Buttons match ${name}'s documented button styles (shape, padding, weight)
□ All Do's applied, all Don'ts avoided`;
}

export function getBrandBySlug(slug: string): BrandInfo | undefined {
  return BRAND_CATALOG.find((b) => b.slug === slug);
}

export const BRAND_CATEGORIES = [
  "Open Source",
  "AI",
  "Dev Tools",
  "Fintech",
  "Automotive",
  "Consumer",
  "Productivity",
  "Media",
  "Gaming",
  "Enterprise",
] as const;

/**
 * Keywords that trigger brand-master (AsyncAPI) auto-injection.
 * Catches: "asyncapi", "async api", "our brand", "brand master", "brand-master"
 */
export const BRAND_MASTER_KEYWORDS = [
  "asyncapi",
  "async api",
  "our brand",
  "brand master",
  "brand-master",
  "our design",
  "our style",
  "our platform",
];
