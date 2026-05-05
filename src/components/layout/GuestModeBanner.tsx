import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function GuestModeBanner() {
  const { guest } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [guest]);

  if (!guest || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-md z-50 bg-amber-500/15 border border-amber-500/30 backdrop-blur rounded-lg p-3 text-sm text-amber-200 flex items-start gap-3 shadow-lg">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold mb-1">Guest mode — work not saved</div>
        <p className="text-xs opacity-90">Your builds exist only in this browser session. Sign in to save projects permanently.</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-amber-400 hover:text-amber-300 transition-colors ml-2"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
