export interface DesignCritiqueCategory {
  score: number;
  note: string;
}

export interface DesignCritique {
  score: number;
  categories: {
    colorHarmony: DesignCritiqueCategory;
    typography: DesignCritiqueCategory;
    spacing: DesignCritiqueCategory;
    layout: DesignCritiqueCategory;
    interactions: DesignCritiqueCategory;
    responsive: DesignCritiqueCategory;
    animation: DesignCritiqueCategory;
    cohesion: DesignCritiqueCategory;
  };
  topIssues: string[];
  autoFixPrompt: string;
}

export const DESIGN_CRITIC_PROMPT = `You are a world-class design critic with the eye of a senior designer at Apple, Figma, or Linear.

Review the generated app for:
1. Color harmony and contrast (WCAG compliance)
2. Typography hierarchy and readability
3. Spacing consistency (is an 8px grid used?)
4. Layout balance and visual weight
5. Interactive state completeness (hover/active/focus)
6. Mobile responsiveness
7. Animation and motion quality
8. Overall aesthetic cohesion

Output ONLY valid JSON (no markdown fences, no extra text):
{
  "score": 8.4,
  "categories": {
    "colorHarmony": { "score": 9, "note": "..." },
    "typography": { "score": 8, "note": "..." },
    "spacing": { "score": 7, "note": "..." },
    "layout": { "score": 9, "note": "..." },
    "interactions": { "score": 6, "note": "..." },
    "responsive": { "score": 8, "note": "..." },
    "animation": { "score": 9, "note": "..." },
    "cohesion": { "score": 9, "note": "..." }
  },
  "topIssues": ["...", "...", "..."],
  "autoFixPrompt": "Fix these specific issues: ..."
}`;

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-build`;

export async function runDesignCritic(
  code: string,
  model: string,
): Promise<DesignCritique | null> {
  const messages = [
    {
      role: "user" as const,
      content: `${DESIGN_CRITIC_PROMPT}\n\nHere is the app code to review:\n\`\`\`jsx\n${code.slice(0, 6000)}\n\`\`\``,
    },
  ];

  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, model, mode: "chat" }),
    });
    if (!resp.ok || !resp.body) return null;

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    let buffer = "";
    let done = false;

    while (!done) {
      const { done: d, value } = await reader.read();
      if (d) break;
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nl).trimEnd();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { done = true; break; }
        try {
          const p = JSON.parse(json);
          const delta = p.choices?.[0]?.delta?.content as string | undefined;
          if (delta) full += delta;
        } catch { /* partial */ }
      }
    }

    const jsonStr = full.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr) as DesignCritique;
  } catch {
    return null;
  }
}

export function getScoreColor(score: number): string {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-amber-400";
  return "text-red-400";
}

export function getScoreDot(score: number): string {
  if (score >= 8) return "bg-emerald-400";
  if (score >= 6) return "bg-amber-400";
  return "bg-red-400";
}
