import { useEffect, useRef, useState } from "react";
import { useRaincastStore } from "@/store/raincastStore";
import { MessageBubble } from "./MessageBubble";
import { PromptInput } from "./PromptInput";
import { useAIBuild } from "@/hooks/useAIBuild";
import { Sparkles, Layers, Gamepad2, LineChart, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function ChatPanel() {
  const messages = useRaincastStore((s) => s.messages);
  const isBuilding = useRaincastStore((s) => s.isBuilding);
  const { send } = useAIBuild();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cat, setCat] = useState<Category>("Apps");

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-panel">
      <div className="h-10 shrink-0 px-3.5 flex items-center border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
            Chat
          </span>
        </div>
        {isBuilding && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-primary">
            <span className="raincast-typing"><span /><span /><span /></span>
            <span>Generating</span>
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto raincast-scroll px-3 py-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-2 relative raincast-aurora rounded-xl">
            <div className="w-14 h-14 rounded-full raincast-orb mb-5" />
            <h2 className="font-display text-3xl leading-tight">
              What do you want <span className="italic text-primary">to build?</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-2 mb-5 max-w-[280px]">
              Describe anything — from a landing page to a live dashboard.
            </p>

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
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>

      <PromptInput onSend={send} />
    </div>
  );
}
