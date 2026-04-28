import { useEffect, useRef, useState } from "react";
import { useRaincastStore } from "@/store/raincastStore";
import { MessageBubble } from "./MessageBubble";
import { PromptInput } from "./PromptInput";
import { useAIBuild } from "@/hooks/useAIBuild";
import { Sparkles, Layers, Gamepad2, LineChart, Palette, Zap, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const seenToggleRef = useRef(false);

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
                        onClick={() => send(s.label)}
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
                    onClick={() => send(s)}
                    className="group text-left flex items-center gap-2.5 text-xs px-3 py-2.5 rounded-lg border border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60 hover:bg-purple-500/10 transition-all hover:-translate-y-[1px]"
                  >
                    <Brain className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="flex-1">{s}</span>
                  </button>
                ))}
              </div>
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

      <PromptInput onSend={send} />
    </div>
  );
}
