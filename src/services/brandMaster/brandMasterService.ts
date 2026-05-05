/**
 * Brand-master service
 * Manages the AsyncAPI brand system loaded from /brand-master/ folder specs.
 * Tracks usage logs (auto-triggered vs user-triggered).
 */

const LS_LOG_KEY = "brand_master_usage_log";
const MAX_LOG_ENTRIES = 200;

export type BrandMasterTrigger = "auto" | "user";

export interface BrandMasterLogEntry {
  id: string;
  timestamp: string;
  trigger: BrandMasterTrigger;
  prompt: string;
  brandSlug: string;
}

/** Append a usage entry to localStorage log. */
export function logBrandMasterUsage(
  prompt: string,
  trigger: BrandMasterTrigger,
  brandSlug = "asyncapi",
): void {
  try {
    const raw = localStorage.getItem(LS_LOG_KEY);
    const entries: BrandMasterLogEntry[] = raw ? JSON.parse(raw) : [];
    const entry: BrandMasterLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      trigger,
      prompt: prompt.slice(0, 200),
      brandSlug,
    };
    entries.unshift(entry);
    const trimmed = entries.slice(0, MAX_LOG_ENTRIES);
    localStorage.setItem(LS_LOG_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore storage errors
  }
}

/** Read all brand-master usage log entries. */
export function getBrandMasterLog(): BrandMasterLogEntry[] {
  try {
    const raw = localStorage.getItem(LS_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Clear the usage log. */
export function clearBrandMasterLog(): void {
  try {
    localStorage.removeItem(LS_LOG_KEY);
  } catch {
    // ignore
  }
}

/** Stats derived from the log. */
export function getBrandMasterStats() {
  const log = getBrandMasterLog();
  return {
    total: log.total ?? log.length,
    auto: log.filter((e) => e.trigger === "auto").length,
    user: log.filter((e) => e.trigger === "user").length,
    lastUsed: log[0]?.timestamp ?? null,
    recentPrompts: log.slice(0, 5).map((e) => e.prompt),
  };
}

/**
 * Build a context string from brand-master data that can be injected
 * into the AI prompt when the AI references or the user requests the brand.
 * This supplements the DESIGN.md injection with runtime log context.
 */
export function buildBrandMasterContext(log: BrandMasterLogEntry[]): string {
  if (log.length === 0) return "";
  const recentPrompts = log.slice(0, 10).map((e) => `  [${e.trigger}] ${e.prompt}`).join("\n");
  return `
<<BRAND_MASTER_CONTEXT>>
The following AsyncAPI brand-master builds have been made in this session and prior sessions.
Use this history to maintain design consistency across builds.

Recent brand-master usage (newest first):
${recentPrompts}

Apply the AsyncAPI brand system to this build. Match prior builds in style.
<<END_BRAND_MASTER_CONTEXT>>
`.trim();
}
