import { useEffect, useRef, useState } from "react";
import { useRaincastStore } from "@/store/raincastStore";
import { MessageBubble } from "./MessageBubble";
import { PromptInput } from "./PromptInput";
import { useAIBuild } from "@/hooks/useAIBuild";
import { Sparkles, Layers, Gamepad2, LineChart, Palette, Zap, Brain, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EmergencePanel } from "@/components/emergence/EmergencePanel";
import { isFigmaUrl } from "@/services/design/figmaService";
import { isDesignSystemRequest } from "@/services/design/designSystemGenerator";
import { BRAND_CATALOG, BRAND_MASTER_KEYWORDS, loadBrandDesignMd } from "@/services/design/designMdLoader";
import { logBrandMasterUsage, getBrandMasterLog, buildBrandMasterContext } from "@/services/brandMaster/brandMasterService";
import { searchProductWebsite, extractBuildTarget } from "@/services/tavilySearch";

type Category = "Apps" | "Landing" | "Games" | "Dashboards";

const SUGGESTIONS: Record<Category, { icon: typeof Sparkles; label: string }[]> = {
  Apps: [
    { icon: Sparkles, label: "Todo app with priorities and dark theme" },
    { icon: Sparkles, label: "Pomodoro timer with circular progress" },
    { icon: Sparkles, label: "Markdown previewer with split view" },
  ],
  Landing: [
    { icon: Palette, label: "Landing page for a luxury EV called AVANT" },
    { icon: Palette, label: "SaaS pricing page, editorial minimal style" },
    { icon: Palette, label: "Agency hero with animated gradient headline" },
  ],
  Games: [
    { icon: Gamepad2, label: "Snake game with neon trails" },
    { icon: Gamepad2, label: "2048 with smooth tile animations" },
    { icon: Gamepad2, label: "Memory match card game" },
  ],
  Dashboards: [
    { icon: LineChart, label: "Analytics dashboard with live charts" },
    { icon: LineChart, label: "Crypto portfolio tracker" },
    { icon: LineChart, label: "Kanban board with drag and drop feel" },
  ],
};

const CATEGORIES: Category[] = ["Apps", "Landing", "Games", "Dashboards"];

function ModePill() {
  const mode = useRaincastStore((s) => s.mode);
  const isPlan = mode === "plan";
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 h-6 pl-1.5 pr-2.5 rounded-full text-[10px] font-medium uppercase tracking-[0.14em] border transition-all duration-300",
        isPlan
          ? "bg-purple-500/15 border-purple-500/40 text-purple-300 shadow-[0_0_12px_-4px_rgba(139,92,246,0.6)]"
          : "bg-primary/15 border-primary/40 text-primary shadow-[0_0_12px_-4px_hsl(var(--primary)/0.6)]",
      )}
      title="Press Shift+Tab to toggle"
    >
      <span
        className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
          isPlan ? "bg-purple-500/30" : "bg-primary/30",
        )}
      >
        {isPlan ? (
          <Brain className="w-2.5 h-2.5" />
        ) : (
          <Zap className="w-2.5 h-2.5" />
        )}
      </span>
      <span className="transition-all duration-300">
        {isPlan ? "Plan Mode" : "Build Mode"}
      </span>
    </div>
  );
}

export function ChatPanel() {
  const messages = useRaincastStore((s) => s.messages);
  const isBuilding = useRaincastStore((s) => s.isBuilding);
  const mode = useRaincastStore((s) => s.mode);
  const toggleMode = useRaincastStore((s) => s.toggleMode);
  const { send } = useAIBuild();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cat, setCat] = useState<Category>("Apps");
  const [figmaLoading, setFigmaLoading] = useState(false);
  const seenToggleRef = useRef(false);
  const figmaToken = useRaincastStore((s) => s.figmaToken);

  const handleSend = async (prompt: string) => {
    const lowerPrompt = prompt.toLowerCase();

    // ── BRAND-MASTER: check if prompt references our own brand ──
    const isBrandMasterTrigger = BRAND_MASTER_KEYWORDS.some((kw) => lowerPrompt.includes(kw));
    // Also detect if user explicitly named a brand that maps to brand-master
    const isUserExplicit = /\basyncapi\b/.test(lowerPrompt);

    if (isBrandMasterTrigger || isUserExplicit) {
      const trigger = isUserExplicit ? "user" : "auto";
      logBrandMasterUsage(prompt, trigger, "asyncapi");

      if (!useRaincastStore.getState().activeBrandSlug) {
        const content = await loadBrandDesignMd("asyncapi");
        if (content) {
          useRaincastStore.getState().setActiveBrand("asyncapi", content);
          toast.success(`AsyncAPI brand-master loaded (${trigger})`);
        }
      }

      // Inject prior brand-master usage log as context
      const log = getBrandMasterLog();
      if (log.length > 1) {
        const ctx = buildBrandMasterContext(log.slice(1)); // skip current entry
        if (ctx) {
          void send(ctx + "\n\n" + prompt);
          return;
        }
      }
    }

    // ── AUTO-BRAND DETECTION: find any other brand mentions ──
    if (!useRaincastStore.getState().activeBrandSlug) {
      const matchedBrand = BRAND_CATALOG.find((brand) => {
        const name = brand.name.toLowerCase();
        const slug = brand.slug.toLowerCase().replace(/[.\-]/g, "");
        return lowerPrompt.includes(name) || lowerPrompt.includes(slug);
      });
      if (matchedBrand) {
        const content = await loadBrandDesignMd(matchedBrand.slug);
        if (content) {
          useRaincastStore.getState().setActiveBrand(matchedBrand.slug, content);
          toast.success(`${matchedBrand.name} design system auto-applied`);
          // Log if it's the brand-master brand
          if (matchedBrand.slug === "asyncapi") {
            logBrandMasterUsage(prompt, "auto", "asyncapi");
          }
        }
      }
    }

    // ── EXPLICIT URL → reverse engineer ──
    const httpsMatch = prompt.match(/https?:\/\/[^\s]+/i);
    const domainMatch = !httpsMatch
      ? prompt.match(/(?:^|\s)([\w-]+\.(?:com|io|ai|co|app|dev|net|org)(?:\/[^\s]*)?)/i)
      : null;
    const detectedUrl = httpsMatch
      ? httpsMatch[0].trim()
      : domainMatch
      ? `https://${domainMatch[1].trim()}`
      : null;

    if (detectedUrl && !isFigmaUrl(prompt)) {
      try {
        const { reverseEngineerUrl } = await import("@/services/emergence");
        const { data: auth } = await (await import("@/integrations/supabase/client")).supabase.auth.getUser();
        toast.info("Analyzing site design…", { duration: 2500 });
        const dna = await reverseEngineerUrl(detectedUrl, auth.user?.id ?? null);
        const enriched = enrichWithMarketContext(prompt);
        void send(`[SITE DNA: ${dna.title} — ${detectedUrl}]\n${dna.promptSuggestion}\n\nUser request: ${enriched}`);
        return;
      } catch {
        // fall through
      }
    }

    // Level 2: Figma URL detection
    if (isFigmaUrl(prompt) && figmaToken) {
      setFigmaLoading(true);
      try {
        const { parseFigmaUrl, extractDesignTokens, getFigmaFrameImage, buildFigmaToCodePrompt } =
          await import("@/services/design/figmaService");
        const { fileKey, nodeId } = parseFigmaUrl(prompt);
        if (fileKey) {
          const tokens = await extractDesignTokens(fileKey, figmaToken);
          const figmaPrompt = buildFigmaToCodePrompt(tokens);
          if (nodeId) {
            try {
              const imgUrl = await getFigmaFrameImage(fileKey, nodeId, figmaToken);
              if (imgUrl) {
                const imgResp = await fetch(imgUrl);
                const blob = await imgResp.blob();
                const file = new File([blob], "figma-frame.png", { type: blob.type });
                const { fileToBase64 } = await import("@/services/design/imageAnalyzer");
                const { base64, mimeType } = await fileToBase64(file);
                useRaincastStore.getState().setUploadedImage(base64, "figma-frame.png", mimeType);
              }
            } catch { /* no image — text-only */ }
          }
          toast.success("Figma design tokens extracted");
          void send(figmaPrompt + "\n\nOriginal Figma URL: " + prompt);
          setFigmaLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Figma extraction failed", e);
        toast.error("Figma fetch failed — sending as normal prompt");
      }
      setFigmaLoading(false);
    }

    // Level 6: Design system request (buildDesignSystemPrompt is already statically imported)
    if (isDesignSystemRequest(prompt)) {
      const { buildDesignSystemPrompt } = await import("@/services/design/designSystemGenerator");
      void send(buildDesignSystemPrompt(prompt));
      return;
    }

    // ── FIX / MODIFY EXISTING BUILD → inject current codebase as context ──
    const FIX_RE = /\b(fix|update|change|improve|tweak|modify|refactor|debug|adjust|add|remove|edit|delete|rename|replace|the navbar|the header|the footer|the button|this app|this site|this page|this component|this build|current build|make it|make the|change the|update the|fix the|add a|remove the|the color|the font|the layout|the style)\b/i;
    const isBuildIntent = /\b(build|make|create|generate|design|clone|copy|like|inspired|style)\b/i.test(prompt);
    const { files: currentFiles } = useRaincastStore.getState();
    const hasExistingCode = Object.keys(currentFiles).length > 0;

    if (FIX_RE.test(lowerPrompt) && hasExistingCode && !detectedUrl && !isFigmaUrl(prompt)) {
      // Build code context from current files (up to ~24 KB)
      const fileEntries = Object.entries(currentFiles);
      let totalSize = 0;
      const codeChunks: string[] = [];
      for (const [path, code] of fileEntries) {
        const chunk = `// FILE: ${path}\n${code}`;
        if (totalSize + chunk.length > 24000) break;
        codeChunks.push(chunk);
        totalSize += chunk.length;
      }
      const codeContext = `[CODEBASE CONTEXT — these are the EXISTING files already built. Read them carefully, then apply ONLY the requested changes. Keep all other code intact.]\n\n${codeChunks.join("\n\n---\n\n")}\n\n[END CODEBASE CONTEXT]`;
      void send(`${codeContext}\n\nUser request: ${prompt}`);
      return;
    }

    // ── BUILD INTENT → Tavily auto-search + market enrichment ──
    if (isBuildIntent) {
      const enriched = enrichWithMarketContext(prompt);
      const isNotReal = /\b(fictional|fake|made.?up|imaginary|concept|fantasy|hypothetical|doesn.?t exist|not real)\b/i.test(lowerPrompt);

      if (!isNotReal) {
        const searchQuery = extractBuildTarget(prompt);
        const tavilyResult = await searchProductWebsite(searchQuery);
        if (tavilyResult) {
          try {
            const { reverseEngineerUrl } = await import("@/services/emergence");
            const { data: auth } = await (await import("@/integrations/supabase/client")).supabase.auth.getUser();
            const dna = await reverseEngineerUrl(tavilyResult.url, auth.user?.id ?? null);
            void send(`[MARKET RESEARCH: ${tavilyResult.title} — ${tavilyResult.url}]\n${dna.promptSuggestion}\n\nUser request: ${enriched}`);
            return;
          } catch {
            // fall through to enriched send
          }
        }
      }

      void send(enriched);
      return;
    }

    void send(prompt);
  };

  function enrichWithMarketContext(prompt: string): string {
    const lower = prompt.toLowerCase();

    // Detect if prompt references something that doesn't exist in real market
    const isNotReal = /\b(fictional|fake|made up|imaginary|doesn'?t exist|not real|made-up|concept|fantasy|hypothetical)\b/i.test(lower);
    if (isNotReal) {
      return `${prompt}\n\n[MARKET NOTE: This is a fictional/concept product. Use only design skills and aesthetic inference — no real-world brand data needed. Invent the best possible version.]`;
    }

    // Detect real-world product categories and inject market context
    const marketHints: Record<string, string> = {
      "music|spotify|apple music|tidal|soundcloud": "Music streaming — leaders: Spotify (dark/green/pill), Apple Music (clean/red/serif), Tidal (premium/dark). Features: player, playlists, discover, library, social.",
      "food|delivery|doordash|uber eats|grubhub|zomato": "Food delivery — leaders: DoorDash (red/white/bold), Uber Eats (black/green). Features: restaurant browse, cart, order tracking, ratings.",
      "social media|twitter|x|instagram|tiktok|threads": "Social media — leaders: X (minimal/dark/white), Instagram (gradient/clean), TikTok (dark/vibrant). Features: feed, post, stories, explore, notifications.",
      "ecommerce|shop|store|amazon|shopify|marketplace": "E-commerce — leaders: Amazon (orange/white/utility), Shopify stores (brand-specific). Features: product grid, cart, checkout, search, filters, reviews.",
      "finance|banking|fintech|wallet|payment|crypto": "Fintech — leaders: Stripe (purple/white/precise), Revolut (dark/blue/pill), Coinbase (blue/white). Features: balance, transactions, send/receive, analytics.",
      "dashboard|analytics|saas|admin|crm": "SaaS dashboard — leaders: Linear (dark/purple), Notion (light/clean), Figma (white/blue). Features: sidebar, main view, charts, tables, notifications.",
      "ai|chatbot|llm|assistant|chat": "AI product — leaders: Claude (warm dark), ChatGPT (clean white), Perplexity (minimal blue). Features: conversation, history, settings, model select.",
      "fitness|workout|health|gym|exercise": "Fitness — leaders: Nike Training (black/bold), Strava (orange/white), Fitbit (teal/clean). Features: workout log, progress charts, goals, social.",
      "travel|hotel|booking|airbnb|flight": "Travel — leaders: Airbnb (coral/white/rounded), Booking.com (blue/clean). Features: search, map view, listing detail, booking, reviews.",
      "news|media|blog|magazine": "Media/News — leaders: The Verge (red/white/editorial), Wired (black/bold). Features: homepage feed, article view, category nav, search.",
    };

    for (const [pattern, hint] of Object.entries(marketHints)) {
      if (new RegExp(pattern, "i").test(lower)) {
        return `${prompt}\n\n[MARKET CONTEXT: ${hint} Use this to build a realistic, competitive product — not a generic template.]`;
      }
    }

    return prompt;
  }

  // Shift+Tab toggles modes globally
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "Tab") {
        // Don't hijack inside text inputs only when no modifier intent? We do want global.
        e.preventDefault();
        toggleMode();
        const next = useRaincastStore.getState().mode;
        if (!seenToggleRef.current && next === "plan") {
          toast("Plan Mode: discuss before building. Shift+Tab to build.", {
            duration: 4000,
          });
          seenToggleRef.current = true;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleMode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const isPlan = mode === "plan";

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-panel transition-all duration-300 relative",
        isPlan && "shadow-[inset_3px_0_0_0_rgb(139,92,246)]",
      )}
    >
      <div className="h-10 shrink-0 px-3.5 flex items-center border-b border-border gap-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              isPlan
                ? "bg-purple-400 shadow-[0_0_8px_rgb(139,92,246)]"
                : "bg-primary shadow-[0_0_8px_hsl(var(--primary))]",
            )}
          />
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
            Chat
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {figmaLoading && (
            <span className="inline-flex items-center gap-1 text-[11px] text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Figma
            </span>
          )}
          {isBuilding && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-primary">
              <span className="raincast-typing"><span /><span /><span /></span>
              <span>{isPlan ? "Thinking" : "Generating"}</span>
            </span>
          )}
          <ModePill />
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto raincast-scroll px-3 py-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-2 relative raincast-aurora rounded-xl">
            <div
              className={cn(
                "w-14 h-14 rounded-full mb-5 transition-all",
                isPlan
                  ? "bg-purple-500/30 shadow-[0_0_40px_rgba(139,92,246,0.5)] animate-pulse"
                  : "raincast-orb",
              )}
            />
            <h2 className="font-display text-3xl leading-tight">
              {isPlan ? (
                <>
                  Let's <span className="italic text-purple-400">plan it</span>.
                </>
              ) : (
                <>
                  What do you want{" "}
                  <span className="italic text-primary">to build?</span>
                </>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 mb-5 max-w-[280px]">
              {isPlan
                ? "Discuss your idea. I'll ask questions and propose a plan."
                : "Describe anything — from a landing page to a live dashboard."}
            </p>

            {!isPlan && (
              <>
                <div className="flex items-center gap-1 p-0.5 rounded-full border border-border bg-background/60 backdrop-blur mb-3">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={cn(
                        "text-[11px] px-2.5 py-1 rounded-full transition-all",
                        cat === c
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-1.5 w-full max-w-sm">
                  {SUGGESTIONS[cat].map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.label}
                        onClick={() => void handleSend(s.label)}
                        className="group text-left flex items-center gap-2.5 text-xs px-3 py-2.5 rounded-lg border border-border bg-background/40 hover:border-primary/50 hover:bg-secondary/60 transition-all hover:-translate-y-[1px]"
                      >
                        <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        <span className="flex-1">{s.label}</span>
                        <Layers className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {isPlan && (
              <div className="grid grid-cols-1 gap-1.5 w-full max-w-sm">
                {[
                  "I want to build a SaaS dashboard for analytics",
                  "Help me plan a portfolio site for a designer",
                  "Plan a habit tracker mobile-style web app",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => void handleSend(s)}
                    className="group text-left flex items-center gap-2.5 text-xs px-3 py-2.5 rounded-lg border border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60 hover:bg-purple-500/10 transition-all hover:-translate-y-[1px]"
                  >
                    <Brain className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="flex-1">{s}</span>
                  </button>
                ))}
              </div>
            )}

            {!isPlan && (
              <button
                onClick={() => void handleSend("Generate a design system for a modern SaaS startup")}
                className="group flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/15 hover:border-primary/60 transition-all text-primary mt-2"
              >
                <Cpu className="w-3 h-3" />
                Generate Design System
              </button>
            )}

            <div className="mt-6 text-[10px] text-muted-foreground/70">
              <kbd className="raincast-kbd">⇧</kbd>
              <kbd className="raincast-kbd ml-1">Tab</kbd>
              <span className="ml-2">
                {isPlan ? "switch to Build Mode" : "switch to Plan Mode"}
              </span>
            </div>
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>

      <EmergencePanel />
      <PromptInput onSend={(p) => void handleSend(p)} />
    </div>
  );
}
