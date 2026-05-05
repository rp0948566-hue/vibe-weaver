import { useRaincastStore } from "@/store/raincastStore";
import { Button } from "@/components/ui/button";
import { History, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function EvolutionTracker() {
  const buildHistory = useRaincastStore((s) => s.buildHistory);
  const setPreviewHtml = useRaincastStore((s) => s.setPreviewHtml);
  const [open, setOpen] = useState(false);

  if (buildHistory.length === 0) return null;

  const restore = (html: string) => {
    setPreviewHtml(html);
    setOpen(false);
  };

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        className={cn("h-7 text-xs gap-1.5", open && "bg-secondary")}
        title="Design history"
      >
        <History className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">History</span>
        <span className="text-[10px] text-muted-foreground">v{buildHistory.length}</span>
      </Button>

      {open && (
        <div className="absolute inset-x-4 top-14 z-30 bg-[#111118] border border-border rounded-xl shadow-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium">Design Evolution</span>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-secondary/60 text-muted-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {buildHistory.map((snap) => (
              <button
                key={snap.id}
                onClick={() => restore(snap.html)}
                className="shrink-0 group flex flex-col gap-1.5 text-[10px]"
                title={snap.prompt}
              >
                <div
                  className="w-32 h-20 rounded-lg overflow-hidden border border-border group-hover:border-primary/50 transition-colors relative bg-black"
                  style={{ position: "relative" }}
                >
                  <iframe
                    srcDoc={snap.html}
                    sandbox="allow-scripts"
                    className="absolute top-0 left-0 border-0 pointer-events-none"
                    style={{
                      width: 1280,
                      height: 800,
                      transform: "scale(0.1)",
                      transformOrigin: "top left",
                    }}
                    title={`v${snap.version}`}
                  />
                </div>
                <span className="text-muted-foreground text-center">v{snap.version}</span>
              </button>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground">Click any version to restore it</p>
        </div>
      )}
    </>
  );
}
