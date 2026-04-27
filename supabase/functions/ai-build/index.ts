// Streams AI responses for RAINCAST via the Lovable AI gateway.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert frontend developer. Generate a complete, self-contained
single-file React app as a JSX component. Requirements:

1. Export default a React component named App
2. Use only: React hooks, inline styles or Tailwind CDN classes
3. DO NOT import any external libraries — React and ReactDOM are already globally available (do not write import statements)
4. The entire app must work in a sandboxed iframe with no build step (Babel Standalone transpiles in the browser)
5. Generate beautiful, production-quality UI with thoughtful spacing, typography, and color
6. Make it fully functional, not a mockup — all buttons, inputs, and interactions must work
7. Return ONLY the JSX code inside a single \`\`\`jsx code block. No prose, no explanation before or after.

When the user asks you to edit an existing app, return the COMPLETE updated file, not a diff.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, model, currentCode } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const sysMessages: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];
    if (currentCode && typeof currentCode === "string" && currentCode.trim()) {
      sysMessages.push({
        role: "system",
        content: `The current version of the app code is:\n\n\`\`\`jsx\n${currentCode}\n\`\`\`\n\nWhen the user requests a change, return the full updated file.`,
      });
    }

    const chosenModel =
      typeof model === "string" && model.length > 0
        ? model
        : "google/gemini-3-flash-preview";

    const upstream = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: chosenModel,
          messages: [...sysMessages, ...(messages ?? [])],
          stream: true,
        }),
      },
    );

    if (!upstream.ok) {
      if (upstream.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit reached. Please wait a moment and try again.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (upstream.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              "AI credits exhausted. Add credits in Settings → Workspace → Usage.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const txt = await upstream.text();
      console.error("AI gateway error", upstream.status, txt);
      return new Response(
        JSON.stringify({ error: "AI gateway error", detail: txt }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (err) {
    console.error("ai-build error", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
