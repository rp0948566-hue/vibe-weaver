import { useRaincastStore } from "@/store/raincastStore";
import { getScoreColor } from "@/services/design/designCritic";
import { useAIBuild } from "@/hooks/useAIBuild";
import { Button } from "@/components/ui/button";
import { Wand2, X, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  colorHarmony: "Color harmony",
  typography: "Typography",
  spacing: "Spacing",
  layout: "Layout",
  interactions: "Interactions",
  responsive: "Responsive",
  animation: "Animation",
  cohesion: "Cohesion",
};

function ScoreIcon({ score }: { score: number }) {
  if (score >= 8) return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
  if (score >= 6) return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
  return <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />;
}

export function DesignCritiquePanel() {
  const show = useRaincastStore((s) => s.showCritiquePanel);
  const critique = useRaincastStore((s) => s.designCritique);
  const score = useRaincastStore((s) => s.designScore);
  const setShow = useRaincastStore((s) => s.setShowCritiquePanel);
  const { send } = useAIBuild();

  if (!show || !critique) return null;

  const autoFix = () => {
    void send(critique.autoFixPrompt);
    setShow(false);
  };

  return (
    <div className="absolute inset-x-4 top-14 z-30 bg-[#111118] border border-border rounded-xl shadow-2xl overflow-hidden text-[12px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 font-medium">
          <span>Design Review</span>
          <span className={cn("font-bold", getScoreColor(score ?? 0))}>
            {(score ?? 0).toFixed(1)}/10
          </span>
        </div>
        <button onClick={() => setShow(false)} className="p-1 rounded hover:bg-secondary/60 text-muted-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-2 max-h-[320px] overflow-y-auto">
        {Object.entries(critique.categories).map(([key, cat]) => (
          <div key={key} className="flex items-center gap-2">
            <ScoreIcon score={cat.score} />
            <span className="text-muted-foreground w-24 shrink-0">{CATEGORY_LABELS[key] ?? key}</span>
            <span className="flex-1 text-foreground">{cat.note}</span>
            <span className={cn("w-5 text-right font-mono tabular-nums", getScoreColor(cat.score))}>
              {cat.score}
            </span>
          </div>
        ))}

        {critique.topIssues.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border space-y-1">
            <div className="text-muted-foreground font-medium text-[11px] uppercase tracking-wide">Top improvements</div>
            {critique.topIssues.map((issue, i) => (
              <div key={i} className="flex gap-1.5">
                <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                <span>{issue}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <Button onClick={autoFix} size="sm" className="w-full h-8 gap-1.5 text-xs shadow-[var(--shadow-glow)]">
          <Wand2 className="w-3.5 h-3.5" />
          Auto-Fix All Issues
        </Button>
      </div>
    </div>
  );
}
