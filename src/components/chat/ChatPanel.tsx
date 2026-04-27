import { useEffect, useRef } from "react";
import { useRaincastStore } from "@/store/raincastStore";
import { MessageBubble } from "./MessageBubble";
import { PromptInput } from "./PromptInput";
import { useAIBuild } from "@/hooks/useAIBuild";
import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Todo app with dark theme and priority tags",
  "Pomodoro timer with circular progress",
  "Pricing page for a SaaS startup",
  "Markdown previewer with live split view",
];

export function ChatPanel() {
  const messages = useRaincastStore((s) => s.messages);
  const isBuilding = useRaincastStore((s) => s.isBuilding);
  const { send } = useAIBuild();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-panel">
      <div className="h-9 shrink-0 px-3 flex items-center border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-medium">
        <Sparkles className="w-3.5 h-3.5 mr-2 text-primary" />
        Chat
        {isBuilding && (
          <span className="ml-auto text-primary normal-case tracking-normal">
            Building…
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto raincast-scroll p-3 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-semibold mb-1">What do you want to build?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Describe any app in natural language.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-xs p-2.5 rounded-md border border-border bg-background/40 hover:border-primary/60 hover:bg-secondary transition-colors"
                >
                  {s}
                </button>
              ))}
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
