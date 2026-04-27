// Extracts code from AI streamed responses.
// Tries fenced code blocks in priority order, falls back to full text.

const FENCE_ORDER = ["jsx", "tsx", "javascript", "js", "html"];

export function extractCode(raw: string): string {
  if (!raw) return "";

  for (const lang of FENCE_ORDER) {
    const re = new RegExp("```" + lang + "\\s*([\\s\\S]*?)```", "i");
    const m = raw.match(re);
    if (m && m[1]) return m[1].trim();
  }

  // Generic fenced block
  const generic = raw.match(/```[a-zA-Z]*\s*([\s\S]*?)```/);
  if (generic && generic[1]) return generic[1].trim();

  // Fallback: strip markdown fences if partial
  return raw.replace(/```[a-zA-Z]*\s*/g, "").replace(/```/g, "").trim();
}

/**
 * Partial extraction for streaming — finds an open code fence and returns
 * everything after it (without waiting for the closing fence).
 */
export function extractPartialCode(raw: string): string | null {
  if (!raw) return null;
  const match = raw.match(/```(?:jsx|tsx|javascript|js|html)?\s*\n([\s\S]*)$/i);
  if (match && match[1]) {
    // If there's a closing fence further along, strip it
    const closed = match[1].split(/```/)[0];
    return closed.trim();
  }
  return null;
}
