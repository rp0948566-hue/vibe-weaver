import { useEffect, useState } from "react";
import { Eye, EyeOff, Check, ExternalLink, Settings as SettingsIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRaincastStore } from "@/store/raincastStore";
import { BrandSetupPanel } from "@/components/design/BrandSetupPanel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface KeyFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  helper?: React.ReactNode;
}

function KeyField({ label, placeholder, value, onChange, helper }: KeyFieldProps) {
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const saved = draft.length > 0 && draft === value;

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-medium">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          type={show ? "text" : "password"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onChange(draft.trim())}
          placeholder={placeholder}
          className="w-full h-10 pl-3 pr-20 rounded-md bg-background border border-border text-sm font-mono focus:outline-none focus:border-primary/60 transition-colors"
          spellCheck={false}
          autoComplete="off"
        />
        <div className="absolute right-2 flex items-center gap-1.5">
          {saved && (
            <span className="text-emerald-400 flex items-center" title="Saved">
              <Check className="w-4 h-4" />
            </span>
          )}
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={show ? "Hide" : "Show"}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {helper && (
        <div className="text-[11px] text-muted-foreground/80 leading-relaxed">
          {helper}
        </div>
      )}
    </div>
  );
}

export function SettingsModal() {
  const open = useRaincastStore((s) => s.settingsOpen);
  const setOpen = useRaincastStore((s) => s.setSettingsOpen);
  const anthropicKey = useRaincastStore((s) => s.anthropicKey);
  const setAnthropicKey = useRaincastStore((s) => s.setAnthropicKey);
  const geminiKey = useRaincastStore((s) => s.geminiKey);
  const setGeminiKey = useRaincastStore((s) => s.setGeminiKey);
  const openrouterKey = useRaincastStore((s) => s.openrouterKey);
  const setOpenrouterKey = useRaincastStore((s) => s.setOpenrouterKey);
  const ollamaUrl = useRaincastStore((s) => s.ollamaUrl);
  const setOllamaUrl = useRaincastStore((s) => s.setOllamaUrl);
  const figmaToken = useRaincastStore((s) => s.figmaToken);
  const setFigmaToken = useRaincastStore((s) => s.setFigmaToken);
  const designPartnerMode = useRaincastStore((s) => s.designPartnerMode);
  const setDesignPartnerMode = useRaincastStore((s) => s.setDesignPartnerMode);

  const handleSave = () => {
    toast.success("Settings saved");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-0 max-w-md backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#1e1e2e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <SettingsIcon className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-display text-xl">Settings</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <section className="space-y-3">
            <h3 className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">
              AI Models
            </h3>
            <KeyField
              label="Gemini API Key (Free)"
              placeholder="AIza…"
              value={geminiKey}
              onChange={setGeminiKey}
              helper={
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Get free key: aistudio.google.com/apikey
                  <ExternalLink className="w-3 h-3" />
                </a>
              }
            />
            <KeyField
              label="Anthropic Key"
              placeholder="sk-ant-…"
              value={anthropicKey}
              onChange={setAnthropicKey}
            />
            <KeyField
              label="OpenRouter Key"
              placeholder="sk-or-v1-…"
              value={openrouterKey}
              onChange={setOpenrouterKey}
              helper={
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Get key: openrouter.ai/keys
                  <ExternalLink className="w-3 h-3" />
                </a>
              }
            />
            <KeyField
              label="Ollama URL (Local)"
              placeholder="http://localhost:11434"
              value={ollamaUrl}
              onChange={setOllamaUrl}
              helper="URL of your local Ollama server. Default: http://localhost:11434"
            />
          </section>


          {/* Design Intelligence */}
          <section className="space-y-3">
            <h3 className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">
              Design Intelligence
            </h3>
            <KeyField
              label="Figma Token"
              placeholder="figd_…"
              value={figmaToken}
              onChange={setFigmaToken}
              helper={
                <a
                  href="https://www.figma.com/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  figma.com/settings → Personal access tokens
                  <ExternalLink className="w-3 h-3" />
                </a>
              }
            />

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-[12px] font-medium">Design Partner Mode</div>
                <div className="text-[10px] text-muted-foreground">AI notices inconsistencies and suggests improvements</div>
              </div>
              <button
                onClick={() => setDesignPartnerMode(!designPartnerMode)}
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                  designPartnerMode ? "bg-primary" : "bg-secondary",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
                    designPartnerMode ? "translate-x-4" : "translate-x-0.5",
                  )}
                />
              </button>
            </div>

            <BrandSetupPanel />
          </section>
        </div>

        <div className="px-6 pb-6">
          <Button
            onClick={handleSave}
            className="w-full h-10 shadow-[var(--shadow-glow)]"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
