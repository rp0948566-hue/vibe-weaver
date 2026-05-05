import { useEffect } from "react";
import { useRaincastStore } from "@/store/raincastStore";
import { supabase } from "@/integrations/supabase/client";
import { getEmergenceStats } from "@/services/emergence";
import { cn } from "@/lib/utils";
import { Brain, Sparkles, TrendingUp } from "lucide-react";

export function EmergencePanel() {
  const emergenceStats = useRaincastStore((s) => s.emergenceStats);
  const setEmergenceStats = useRaincastStore((s) => s.setEmergenceStats);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return;
      const stats = await getEmergenceStats(userId);
      if (!cancelled) setEmergenceStats(stats);
    }
    void load();
    return () => { cancelled = true; };
  }, [setEmergenceStats]);

  if (!emergenceStats || emergenceStats.totalBuilds === 0) return null;

  const { totalBuilds, topPatterns } = emergenceStats;
  const compPatterns = topPatterns.filter((p) => p.category === "component").slice(0, 4);
  const stylePatterns = topPatterns.filter((p) => p.category === "style").slice(0, 4);

  return (
    <div className="mx-3 mb-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-[11px] space-y-2">
      <div className="flex items-center gap-1.5 text-primary font-medium">
        <Brain className="w-3.5 h-3.5" />
        <span>Emergence Engine</span>
        <span className="ml-auto flex items-center gap-1 text-muted-foreground">
          <TrendingUp className="w-3 h-3" />
          {totalBuilds} build{totalBuilds !== 1 ? "s" : ""}
        </span>
      </div>

      {compPatterns.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {compPatterns.map((p) => (
            <span
              key={p.key}
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border",
                "bg-primary/10 border-primary/30 text-primary",
              )}
            >
              <Sparkles className="w-2.5 h-2.5" />
              {p.key}
              <span className="opacity-60">×{p.count}</span>
            </span>
          ))}
          {stylePatterns.map((p) => (
            <span
              key={p.key}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border bg-secondary/60 border-border text-muted-foreground"
            >
              {p.key}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
