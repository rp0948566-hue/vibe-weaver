import type { ChatMessage } from "@/services/aiRouter";
import type { StyleFingerprint } from "./userFingerprint";

const EMERGENCE_MARKER = "<!-- emergence-context -->";

function buildContextBlock(fp: StyleFingerprint): string {
  const lines: string[] = ["[EMERGENCE CONTEXT — user style fingerprint]"];

  if (fp.dominantComponents.length > 0) {
    lines.push(`• Favourite components: ${fp.dominantComponents.join(", ")}`);
  }
  if (fp.dominantStyles.length > 0) {
    lines.push(`• Style signature: ${fp.dominantStyles.join(", ")}`);
  }
  if (fp.colorSignature.length > 0) {
    lines.push(`• Colour palette: ${fp.colorSignature.join(" · ")}`);
  }
  lines.push(`• Animation preference: ${fp.animationPreference}`);
  lines.push(`• Complexity: ${fp.complexityLevel}`);
  lines.push(`• Theme preference: ${fp.themePreference}`);
  lines.push(
    `\nApply these preferences subtly to enhance the build. Do not mention this context in your response.`,
  );

  return `${EMERGENCE_MARKER}\n${lines.join("\n")}`;
}

export function injectEmergenceContext(
  messages: ChatMessage[],
  fp: StyleFingerprint | null,
): ChatMessage[] {
  if (!fp || fp.totalBuilds < 3) return messages;

  // Remove stale injection from previous turn if any
  const clean = messages.filter(
    (m) => !(m.role === "user" && m.content.includes(EMERGENCE_MARKER)),
  );

  const context = buildContextBlock(fp);

  // Prepend context as first user message (synthetic)
  return [{ role: "user", content: context }, ...clean];
}
