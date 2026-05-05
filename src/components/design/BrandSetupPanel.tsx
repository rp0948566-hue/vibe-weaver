import { useState } from "react";
import { useRaincastStore } from "@/store/raincastStore";
import { DEFAULT_BRAND, AESTHETICS, saveBrandTokens } from "@/services/design/designTokens";
import type { BrandTokens } from "@/services/design/designTokens";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-muted-foreground w-20 shrink-0">{label}</label>
      <div className="flex items-center gap-2 flex-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-md border border-border cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-8 px-2 text-[11px] font-mono bg-background border border-border rounded-md focus:outline-none focus:border-primary/60"
          maxLength={9}
        />
      </div>
    </div>
  );
}

export function BrandSetupPanel() {
  const storeBrand = useRaincastStore((s) => s.brandTokens);
  const setBrandTokens = useRaincastStore((s) => s.setBrandTokens);
  const [brand, setBrand] = useState<BrandTokens>(storeBrand ?? DEFAULT_BRAND);
  const [expanded, setExpanded] = useState(false);

  function updateColor(key: keyof BrandTokens["colors"], value: string) {
    setBrand((b) => ({ ...b, colors: { ...b.colors, [key]: value } }));
  }

  function save() {
    saveBrandTokens(brand);
    setBrandTokens(brand);
  }

  function reset() {
    setBrand(DEFAULT_BRAND);
    saveBrandTokens(DEFAULT_BRAND);
    setBrandTokens(DEFAULT_BRAND);
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between w-full text-[11px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="uppercase tracking-[0.16em] font-medium">Brand Setup</span>
        <span className="text-[10px]">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="space-y-3 pl-0">
          {/* Name */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-muted-foreground w-20 shrink-0">Brand name</label>
            <input
              value={brand.name}
              onChange={(e) => setBrand((b) => ({ ...b, name: e.target.value }))}
              className="flex-1 h-8 px-2 text-[11px] bg-background border border-border rounded-md focus:outline-none focus:border-primary/60"
              placeholder="My Brand"
            />
          </div>

          {/* Colors */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">Colors</div>
            {(["primary", "background", "surface", "text", "accent"] as const).map((key) => (
              <ColorField key={key} label={key} value={brand.colors[key]} onChange={(v) => updateColor(key, v)} />
            ))}
          </div>

          {/* Typography */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">Typography</div>
            {(["displayFont", "bodyFont"] as const).map((key) => (
              <div key={key} className="flex items-center gap-2">
                <label className="text-[11px] text-muted-foreground w-20 shrink-0">
                  {key === "displayFont" ? "Display" : "Body"}
                </label>
                <input
                  value={brand.typography[key]}
                  onChange={(e) => setBrand((b) => ({ ...b, typography: { ...b.typography, [key]: e.target.value } }))}
                  className="flex-1 h-8 px-2 text-[11px] bg-background border border-border rounded-md focus:outline-none focus:border-primary/60"
                  placeholder="Inter"
                />
              </div>
            ))}
          </div>

          {/* Aesthetic */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">Aesthetic</div>
            <div className="flex flex-wrap gap-1">
              {AESTHETICS.map((a) => (
                <button
                  key={a}
                  onClick={() => setBrand((b) => ({ ...b, aesthetic: a }))}
                  className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] border transition-colors capitalize",
                    brand.aesthetic === a
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "border-border text-muted-foreground hover:border-border/80",
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Swatch preview */}
          <div className="flex gap-1.5 pt-1">
            {Object.entries(brand.colors).slice(0, 6).map(([k, v]) => (
              <div key={k} className="w-6 h-6 rounded-md border border-border" style={{ background: v }} title={k} />
            ))}
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={save} className="h-7 text-[11px] flex-1">Apply to builds</Button>
            <Button size="sm" variant="ghost" onClick={reset} className="h-7 text-[11px]">Reset</Button>
          </div>
        </div>
      )}
    </div>
  );
}
