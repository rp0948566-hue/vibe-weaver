import { useEffect, useRef, useState } from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  RotateCw,
  AlertTriangle,
  Play,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRaincastStore } from "@/store/raincastStore";
import { useAIBuild } from "@/hooks/useAIBuild";
import { usePreviewErrors } from "@/hooks/usePreviewErrors";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SIZES = {
  desktop: { w: "100%", h: "100%" },
  tablet: { w: "768px", h: "1024px" },
  mobile: { w: "390px", h: "780px" },
};

export function PreviewPanel() {
  usePreviewErrors();
  const previewHtml = useRaincastStore((s) => s.previewHtml);
  const isBuilding = useRaincastStore((s) => s.isBuilding);
  const device = useRaincastStore((s) => s.device);
  const setDevice = useRaincastStore((s) => s.setDevice);
  const previewError = useRaincastStore((s) => s.previewError);
  const setPreviewError = useRaincastStore((s) => s.setPreviewError);
  const { regenerate } = useAIBuild();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    setNonce((n) => n + 1);
    setPreviewError(null);
  }, [previewHtml, setPreviewError]);

  const reload = () => setNonce((n) => n + 1);

  const openInNewTab = () => {
    if (!previewHtml) return;
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      toast.error("Popup blocked — allow popups for this site");
    }
    // Revoke later so the new tab has time to load
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const size = SIZES[device];

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-panel rounded-md",
        isBuilding && "raincast-building-border",
      )}
    >
      <div className="h-9 shrink-0 px-3 flex items-center border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-medium">
        <Play className="w-3.5 h-3.5 mr-2 text-primary" />
        Preview
        <div className="ml-auto flex items-center gap-1">
          <div className="flex items-center border border-border rounded-md p-0.5 bg-background">
            {(["desktop", "tablet", "mobile"] as const).map((d) => {
              const Icon =
                d === "desktop"
                  ? Monitor
                  : d === "tablet"
                    ? Tablet
                    : Smartphone;
              return (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={cn(
                    "p-1 rounded-sm transition-colors",
                    device === d
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-label={d}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={reload}
            className="h-7 text-xs"
            disabled={!previewHtml}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div
        className="flex-1 min-h-0 bg-black/40 p-4 flex items-center justify-center overflow-auto relative"
        style={{ boxShadow: "var(--shadow-preview)" }}
      >
        {previewHtml ? (
          <div
            className="rounded-lg bg-white overflow-hidden shadow-2xl transition-all"
            style={{
              width: size.w,
              height: size.h,
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          >
            <iframe
              key={nonce}
              ref={iframeRef}
              title="RAINCAST preview"
              srcDoc={previewHtml}
              sandbox="allow-scripts"
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <div className="w-12 h-12 mx-auto rounded-full bg-secondary flex items-center justify-center mb-3">
              <Play className="w-5 h-5" />
            </div>
            <p className="text-sm">Your live app will render here.</p>
          </div>
        )}

        {previewError && (
          <div className="absolute inset-x-4 bottom-4 bg-destructive/10 border border-destructive/40 backdrop-blur rounded-md p-3 text-xs text-destructive flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold mb-0.5">Runtime error</div>
              <div className="font-mono truncate">{previewError}</div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={regenerate}
              className="h-7 text-xs shrink-0"
            >
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
