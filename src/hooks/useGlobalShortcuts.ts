import { useEffect } from "react";
import { useRaincastStore } from "@/store/raincastStore";
import { exportAndDownload } from "@/services/projectExporter";
import { toast } from "sonner";

export function useGlobalShortcuts() {
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      // Cmd/Ctrl+S — export project as ZIP
      if (e.key.toLowerCase() === "s" && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        const state = useRaincastStore.getState();
        if (Object.keys(state.files).length === 0) {
          toast.error("Nothing to export yet");
          return;
        }
        try {
          await exportAndDownload({
            files: state.files,
            entry: state.entryFile,
            previewHtml: state.previewHtml,
            projectTitle: state.activeProjectTitle,
          });
          toast.success("Project downloaded");
        } catch (err) {
          console.error("export failed", err);
          toast.error("Export failed");
        }
        return;
      }

      // Cmd/Ctrl+, — open settings
      if (e.key === "," && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        useRaincastStore.getState().setSettingsOpen(true);
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
