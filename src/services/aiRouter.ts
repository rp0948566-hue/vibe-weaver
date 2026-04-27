// Streams AI responses from the ai-build edge function, token-by-token.

export type ChatMessage = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-build`;

export interface StreamArgs {
  messages: ChatMessage[];
  model: string;
  currentCode?: string;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (err: { status?: number; message: string }) => void;
  signal?: AbortSignal;
}

export async function streamAIBuild(args: StreamArgs): Promise<void> {
  const { messages, model, currentCode, onDelta, onDone, onError, signal } =
    args;

  let resp: Response;
  try {
    resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, model, currentCode }),
      signal,
    });
  } catch (e) {
    onError({ message: e instanceof Error ? e.message : "Network error" });
    return;
  }

  if (!resp.ok) {
    try {
      const j = await resp.json();
      onError({ status: resp.status, message: j.error ?? "AI request failed" });
    } catch {
      onError({ status: resp.status, message: "AI request failed" });
    }
    return;
  }
  if (!resp.body) {
    onError({ message: "No response stream" });
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done = false;

  while (!done) {
    const { done: streamDone, value } = await reader.read();
    if (streamDone) break;
    buffer += decoder.decode(value, { stream: true });

    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line || line.startsWith(":")) continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") {
        done = true;
        break;
      }
      try {
        const parsed = JSON.parse(json);
        const delta = parsed.choices?.[0]?.delta?.content as
          | string
          | undefined;
        if (delta) onDelta(delta);
      } catch {
        // partial JSON — push back and wait for more
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }

  // flush
  if (buffer.trim()) {
    for (let raw of buffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (!raw.startsWith("data: ")) continue;
      const json = raw.slice(6).trim();
      if (json === "[DONE]") continue;
      try {
        const parsed = JSON.parse(json);
        const delta = parsed.choices?.[0]?.delta?.content as
          | string
          | undefined;
        if (delta) onDelta(delta);
      } catch {
        /* ignore */
      }
    }
  }

  onDone();
}

export const AVAILABLE_MODELS = [
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (fast)" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro (preview)" },
  { id: "openai/gpt-5", label: "GPT-5" },
  { id: "openai/gpt-5-mini", label: "GPT-5 Mini" },
] as const;
