export interface PatternResult {
  componentTypes: string[];
  styleTags: string[];
  colorPalette: string[];
}

// Component patterns: keyword → tag
const COMPONENT_RULES: Array<[RegExp, string]> = [
  [/\b(navbar|nav\s*bar|navigation|header)\b/i, "navbar"],
  [/\b(hero|landing|headline|banner)\b/i, "hero"],
  [/\b(card|tile|grid)\b/i, "cards"],
  [/\b(dashboard|analytics|chart|graph|recharts|visx)\b/i, "dashboard"],
  [/\b(modal|dialog|popup|drawer)\b/i, "modal"],
  [/\b(form|input|textarea|select|checkbox|radio)\b/i, "form"],
  [/\b(table|thead|tbody|tr|th|td)\b/i, "table"],
  [/\b(sidebar|side.?bar|panel)\b/i, "sidebar"],
  [/\b(button|btn|cta)\b/i, "button"],
  [/\b(toast|notification|alert|snack)\b/i, "toast"],
  [/\b(avatar|profile|user)\b/i, "avatar"],
  [/\b(search|filter|autocomplete)\b/i, "search"],
  [/\b(carousel|slider|swiper)\b/i, "carousel"],
  [/\b(map|leaflet|mapbox)\b/i, "map"],
  [/\b(game|snake|tetris|breakout)\b/i, "game"],
  [/\b(timer|countdown|clock)\b/i, "timer"],
  [/\b(calendar|datepicker|date)\b/i, "calendar"],
  [/\b(pricing|plan|tier)\b/i, "pricing"],
  [/\b(portfolio|project|showcase)\b/i, "portfolio"],
];

// Style patterns
const STYLE_RULES: Array<[RegExp, string]> = [
  [/dark|night|noir|#[01][0-9a-f]{5}/i, "dark-theme"],
  [/glass|backdrop-blur|bg-white\/|bg-black\//i, "glassmorphism"],
  [/gradient|from-|to-|via-/i, "gradient"],
  [/animate-|transition|duration-|motion\./i, "animated"],
  [/tailwind|className=/i, "tailwind"],
  [/minimal|clean|simple|whitespace/i, "minimal"],
  [/neon|glow|shadow.*blue|shadow.*purple|shadow.*green/i, "neon"],
  [/serif|display|playfair|instrument/i, "editorial"],
  [/rounded-full|pill|capsule/i, "rounded"],
  [/grid-cols|flex|masonry/i, "grid-layout"],
  [/parallax|scroll.*Y|IntersectionObserver/i, "parallax"],
  [/3d|perspective|rotate[XYZ]|transform/i, "3d-effects"],
  [/emoji|😀|🎉|✨|🚀/u, "emoji-heavy"],
  [/mono|font-mono|code|pre/i, "monospace"],
  [/luxury|premium|elegant|gold|#[a-f]{2}8[0-4]/i, "luxury"],
];

// Hex color extraction
const HEX_RE = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;

// Tailwind color extraction
const TW_COLOR_RE = /(?:bg|text|border|from|to|via)-([a-z]+-\d{2,3})/g;

const TW_PALETTE_NAMES: Record<string, string> = {
  slate: "#64748b", gray: "#6b7280", zinc: "#71717a", stone: "#78716c",
  red: "#ef4444", orange: "#f97316", amber: "#f59e0b", yellow: "#eab308",
  lime: "#84cc16", green: "#22c55e", emerald: "#10b981", teal: "#14b8a6",
  cyan: "#06b6d4", sky: "#0ea5e9", blue: "#3b82f6", indigo: "#6366f1",
  violet: "#8b5cf6", purple: "#a855f7", fuchsia: "#d946ef", pink: "#ec4899",
  rose: "#f43f5e",
};

export function detectPatterns(code: string): PatternResult {
  const componentTypes: string[] = [];
  const styleTags: string[] = [];
  const colorSet = new Set<string>();

  for (const [re, tag] of COMPONENT_RULES) {
    if (re.test(code) && !componentTypes.includes(tag)) {
      componentTypes.push(tag);
    }
  }

  for (const [re, tag] of STYLE_RULES) {
    if (re.test(code) && !styleTags.includes(tag)) {
      styleTags.push(tag);
    }
  }

  // Extract hex colors (top 5 most frequent)
  const hexMatches = [...code.matchAll(HEX_RE)].map((m) => m[0].toLowerCase());
  const hexFreq: Record<string, number> = {};
  for (const h of hexMatches) hexFreq[h] = (hexFreq[h] ?? 0) + 1;
  Object.entries(hexFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([h]) => colorSet.add(h));

  // Extract Tailwind color classes → approximate hex
  for (const m of code.matchAll(TW_COLOR_RE)) {
    const name = m[1].split("-")[0];
    if (TW_PALETTE_NAMES[name]) colorSet.add(TW_PALETTE_NAMES[name]);
    if (colorSet.size >= 8) break;
  }

  return {
    componentTypes,
    styleTags,
    colorPalette: [...colorSet].slice(0, 8),
  };
}
