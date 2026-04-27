import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { useRaincastStore } from "@/store/raincastStore";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  onSend: (v: string) => void;
}

export function PromptInput({ onSend }: PromptInputProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const isBuilding = useRaincastStore((s) => s.isBuilding);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        taRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Auto-resize
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }, [value]);

  const submit = () => {
    const v = value.trim();
    if (!v || isBuilding) return;
    onSend(v);
    setValue("");
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const canSend = !!value.trim() && !isBuilding;

  return (
    <div className="border-t border-border p-3 bg-panel">
      <div
        className={cn(
          "relative rounded-xl border bg-background/80 backdrop-blur transition-all",
          focused
            ? "border-primary/60 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
            : "border-border hover:border-border/80",
        )}
      >
        <div className="flex items-center gap-1.5 px-3 pt-2.5">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Prompt
          </span>
          <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="raincast-kbd">⌘</span>
            <span className="raincast-kbd">K</span>
            <span className="ml-1">to focus</span>
          </div>
        </div>
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={2}
          placeholder="Describe the app you want to build…"
          className="w-full resize-none bg-transparent px-3 py-2 pr-14 text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground/70 min-h-[52px] max-h-[180px]"
          disabled={isBuilding}
        />
        <div className="flex items-center justify-between px-3 pb-2">
          <span className="text-[10px] text-muted-foreground">
            <kbd className="raincast-kbd">Enter</kbd>
            <span className="mx-1.5">to send</span>
            <kbd className="raincast-kbd">⇧ Enter</kbd>
            <span className="ml-1.5">for new line</span>
          </span>
          <button
            onClick={submit}
            disabled={!canSend}
            aria-label="Send prompt"
            className={cn(
              "h-7 w-7 rounded-md flex items-center justify-center transition-all",
              canSend
                ? "bg-primary text-primary-foreground hover:brightness-110 shadow-[var(--shadow-glow)]"
                : "bg-secondary text-muted-foreground cursor-not-allowed",
            )}
          >
            {isBuilding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
