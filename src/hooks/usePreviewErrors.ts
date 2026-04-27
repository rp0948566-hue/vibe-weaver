import { useEffect } from "react";
import { useRaincastStore } from "@/store/raincastStore";

export function usePreviewErrors() {
  const setPreviewError = useRaincastStore((s) => s.setPreviewError);
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "preview-error") {
        setPreviewError(String(e.data.message || "Unknown runtime error"));
      } else if (e.data.type === "preview-ready") {
        setPreviewError(null);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [setPreviewError]);
}
