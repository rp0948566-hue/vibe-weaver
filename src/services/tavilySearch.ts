const TAVILY_KEY = import.meta.env.VITE_TAVILY_API_KEY as string | undefined;

export interface TavilyResult {
  url: string;
  title: string;
  content: string;
}

/** Search Tavily for a product/brand website. Returns best match or null. */
export async function searchProductWebsite(query: string): Promise<TavilyResult | null> {
  if (!TAVILY_KEY) return null;
  try {
    const resp = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_KEY,
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: false,
        include_raw_content: false,
      }),
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as { results?: TavilyResult[] };
    const results = data.results ?? [];
    // Prefer official product/company sites over articles and directories
    const SKIP_HOSTS = ["wikipedia", "reddit", "quora", "medium", "stackoverflow", "youtube", "twitter", "facebook", "linkedin", "producthunt"];
    const best = results.find((r) => {
      try {
        const host = new URL(r.url).hostname.replace("www.", "");
        return !SKIP_HOSTS.some((h) => host.includes(h));
      } catch {
        return true;
      }
    });
    return best ?? results[0] ?? null;
  } catch {
    return null;
  }
}

const KNOWN_BRANDS = [
  "spotify", "netflix", "airbnb", "stripe", "notion", "linear", "figma", "vercel",
  "shopify", "uber", "apple", "google", "amazon", "twitter", "instagram", "tiktok",
  "discord", "slack", "github", "dropbox", "zoom", "pinterest", "reddit", "youtube",
  "tesla", "ferrari", "lamborghini", "bugatti", "bmw", "nike", "starbucks", "coinbase",
  "binance", "paypal", "revolut", "cursor", "raycast", "supabase", "mongodb", "intercom",
  "framer", "webflow", "openai", "anthropic", "perplexity", "midjourney", "huggingface",
  "doordash", "instacart", "lyft", "booking", "expedia", "tripadvisor", "duolingo",
  "headspace", "calm", "robinhood", "wealthfront", "plaid", "sentry", "posthog",
  "hashicorp", "clickhouse", "expo", "resend", "warp", "miro", "airtable", "cal",
  "loom", "asana", "trello", "jira", "confluence", "hubspot", "salesforce",
];

/** Extract the best Tavily search query from a build prompt. */
export function extractBuildTarget(prompt: string): string {
  const lower = prompt.toLowerCase();

  // "like X", "inspired by X", "clone of X", "similar to X", "copy of X"
  const likeMatch = lower.match(
    /(?:like|inspired by|clone of|clone|copy of|similar to|based on)\s+([\w.\s-]+?)(?:\s+(?:but|with|and|,|\.)|\s*$)/i,
  );
  if (likeMatch) {
    const target = likeMatch[1].trim().split(/\s+/).slice(0, 3).join(" ");
    return target + " official website";
  }

  // Known brand names anywhere in prompt
  for (const brand of KNOWN_BRANDS) {
    if (lower.includes(brand)) return brand + " official website";
  }

  // Generic product type extraction: "build a music streaming app"
  const typeMatch = lower.match(
    /\b(?:build|make|create|generate|design)\s+(?:a|an|the)?\s*([\w\s-]+?)(?:\s+(?:app|website|site|platform|tool|dashboard|landing|page|ui|clone)\b)/i,
  );
  if (typeMatch) {
    const type = typeMatch[1].trim().split(/\s+/).slice(0, 4).join(" ");
    return type + " app website";
  }

  return prompt.slice(0, 80) + " website";
}
