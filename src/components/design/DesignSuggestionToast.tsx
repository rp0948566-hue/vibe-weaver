import { useRaincastStore } from "@/store/raincastStore";
import { useAIBuild } from "@/hooks/useAIBuild";
import { Wand2, X, Lightbulb, AlertTriangle, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_ICONS = {
  inconsistency: AlertTriangle,
  improvement: Lightbulb,
  variant: Layers,
};

const PRIORITY_BORDER = {
  high: "border-red-500/40",
  medium: "border-amber-500/30",
  low: "border-border",
};

export function DesignSuggestionToast() {
  const suggestions = useRaincastStore((s) => s.designSuggestions);
  const dismiss = useRaincastStore((s) => s.dismissSuggestion);
  const partnerMode = useRaincastStore((s) => s.designPartnerMode);
  const { send } = useAIBuild();

  if (!partnerMode || suggestions.length === 0) return null;

  const top = suggestions.slice(0, 3);

  return (
    <div className="absolute right-4 bottom-4 z-40 flex flex-col gap-2 max-w-xs w-full">
      {top.map((s) => {
        const Icon = TYPE_ICONS[s.type];
        return (
          <div
            key={s.id}
            className={cn(
              "bg-[#111118] border rounded-xl p-3 shadow-2xl text-[11px] space-y-2",
              PRIORITY_BORDER[s.priority],
            )}
          >
            <div className="flex items-start gap-2">
              <Icon className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <span className="flex-1 leading-relaxed">{s.message}</span>
              <button
                onClick={() => dismiss(s.id)}
                className="p-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={() => { void send(s.autoFixPrompt); dismiss(s.id); }}
              className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
            >
              <Wand2 className="w-3 h-3" />
              Apply fix
            </button>
          </div>
        );
      })}
    </div>
  );
}
