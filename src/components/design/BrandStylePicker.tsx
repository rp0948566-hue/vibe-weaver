import { useState, useCallback } from "react";
import { useRaincastStore } from "@/store/raincastStore";
import {
  BRAND_CATALOG,
  BRAND_CATEGORIES,
  loadBrandDesignMd,
  getBrandBySlug,
} from "@/services/design/designMdLoader";
import { cn } from "@/lib/utils";
import { Sparkles, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export function BrandStylePicker() {
  const activeBrandSlug = useRaincastStore((s) => s.activeBrandSlug);
  const setActiveBrand = useRaincastStore((s) => s.setActiveBrand);
  const clearBrand = useRaincastStore((s) => s.clearBrand);

  const [loading, setLoading] = useState<string | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handlePick = useCallback(
    async (slug: string) => {
      if (slug === activeBrandSlug) {
        clearBrand();
        return;
      }
      setLoading(slug);
      const content = await loadBrandDesignMd(slug);
      setLoading(null);
      if (!content) {
        toast.error("Couldn't load that brand's design system.");
        return;
      }
      setActiveBrand(slug, content);
      const brand = getBrandBySlug(slug);
      toast.success(`${brand?.name ?? slug} style activated`);
      setExpanded(false);
    },
    [activeBrandSlug, setActiveBrand, clearBrand],
  );

  const activeBrand = activeBrandSlug ? getBrandBySlug(activeBrandSlug) : null;

  return (
    <div className="px-3 py-2 border-b border-border/60 bg-panel/40 backdrop-blur">
      {/* Collapsed state — show active brand pill or "Pick style" prompt */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-primary/80 shrink-0" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold shrink-0">
          Style
        </span>

        {activeBrand ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {/* Active brand chip */}
            <button
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border border-primary/40 bg-primary/10 text-primary whitespace-nowrap"
              onClick={() => setExpanded((v) => !v)}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: activeBrand.primaryColor }}
              />
              {activeBrand.name}
              <ChevronDown
                className={cn(
                  "w-3 h-3 transition-transform",
                  expanded && "rotate-180",
                )}
              />
            </button>
            <button
              onClick={clearBrand}
              className="p-0.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              title="Clear brand style"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Pick a brand style (70 available)</span>
            <ChevronDown
              className={cn(
                "w-3 h-3 transition-transform",
                expanded && "rotate-180",
              )}
            />
          </button>
        )}
      </div>

      {/* Expanded picker */}
      {expanded && (
        <div className="mt-3 space-y-3 max-h-72 overflow-y-auto raincast-scroll pr-1">
          {BRAND_CATEGORIES.map((cat) => {
            const brands = BRAND_CATALOG.filter((b) => b.category === cat);
            const isOpen = openCategory === cat;
            return (
              <div key={cat}>
                {/* Category header */}
                <button
                  onClick={() => setOpenCategory(isOpen ? null : cat)}
                  className="flex items-center justify-between w-full text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold py-1 hover:text-foreground transition-colors"
                >
                  <span>
                    {cat}
                    <span className="ml-1.5 opacity-50">({brands.length})</span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>

                {/* Brand pills */}
                {isOpen && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5 pb-1">
                    {brands.map((brand) => {
                      const isActive = activeBrandSlug === brand.slug;
                      const isLoading = loading === brand.slug;
                      return (
                        <button
                          key={brand.slug}
                          onClick={() => handlePick(brand.slug)}
                          disabled={isLoading}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all",
                            isActive
                              ? "border-primary/60 bg-primary/15 text-primary"
                              : "border-border/60 bg-secondary/40 text-muted-foreground hover:border-border hover:text-foreground hover:bg-secondary/80",
                            isLoading && "opacity-50 cursor-wait",
                          )}
                          title={`Apply ${brand.name} design system`}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: brand.primaryColor }}
                          />
                          {isLoading ? "Loading…" : brand.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
