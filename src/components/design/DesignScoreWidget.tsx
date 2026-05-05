import { useRaincastStore } from "@/store/raincastStore";
import { getScoreColor, getScoreDot } from "@/services/design/designCritic";
import { cn } from "@/lib/utils";

export function DesignScoreWidget() {
  const score = useRaincastStore((s) => s.designScore);
  const setShow = useRaincastStore((s) => s.setShowCritiquePanel);
  const show = useRaincastStore((s) => s.showCritiquePanel);

  if (score === null) return null;

  return (
    <button
      onClick={() => setShow(!show)}
      title="Design critique — click for details"
      className={cn(
        "flex items-center gap-1.5 h-7 px-2 rounded-md border text-[11px] font-medium transition-colors",
        show
          ? "bg-secondary border-border text-foreground"
          : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-border/80",
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", getScoreDot(score))} />
      <span className={getScoreColor(score)}>{score.toFixed(1)}</span>
      <span className="text-muted-foreground">/10</span>
    </button>
  );
}
