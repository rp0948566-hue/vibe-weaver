import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRaincastStore } from "@/store/raincastStore";

interface PromptInputProps {
  onSend: (v: string) => void;
}

export function PromptInput({ onSend }: PromptInputProps) {
  const [value, setValue] = useState("");
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

  const submit = () => {
    const v = value.trim();
    if (!v || isBuilding) return;
    onSend(v);
    setValue("");
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-border p-3 bg-panel">
      <div className="relative rounded-lg border border-border bg-background focus-within:border-primary/60 transition-colors">
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          rows={3}
          placeholder="Describe the app you want to build…  (⌘+Enter to send)"
          className="w-full resize-none bg-transparent px-3 py-2.5 pr-12 text-sm outline-none placeholder:text-muted-foreground"
          disabled={isBuilding}
        />
        <Button
          size="icon"
          onClick={submit}
          disabled={!value.trim() || isBuilding}
          className="absolute bottom-2 right-2 h-8 w-8"
        >
          {isBuilding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
