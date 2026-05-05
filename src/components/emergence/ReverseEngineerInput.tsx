import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { reverseEngineerUrl } from "@/services/emergence";
import type { DesignDNA } from "@/services/emergence";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe, Loader2, Wand2, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BRAND_CATALOG, loadBrandDesignMd, getBrandBySlug } from "@/services/design/designMdLoader";
import { useRaincastStore } from "@/store/raincastStore";

interface Props {
  onPrompt: (prompt: string) => void;
  onClose: () => void;
}

export function ReverseEngineerInput({ onPrompt, onClose }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [dna, setDna] = useState<DesignDNA | null>(null);
  const [matchedBrandSlug, setMatchedBrandSlug] = useState<string | null>(null);
  const setActiveBrand = useRaincastStore((s) => s.setActiveBrand);

  async function analyse() {
    const trimmed = url.trim();
    if (!trimmed) return;
    const withProtocol = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    setLoading(true);
    setMatchedBrandSlug(null);
    try {
      // Check if URL matches a known brand first
      const hostname = (() => { try { return new URL(withProtocol).hostname.replace(/^www\./, ""); } catch { return trimmed; } })();
      const catalogMatch = BRAND_CATALOG.find((b) => {
        const slug = b.slug.toLowerCase();
        const name = b.name.toLowerCase();
        return hostname.includes(slug) || hostname.includes(name) || slug.includes(hostname.split(".")[0]);
      });

      const { data: auth } = await supabase.auth.getUser();
      const result = await reverseEngineerUrl(withProtocol, auth.user?.id ?? null);
      setDna(result);

      if (catalogMatch) {
        setMatchedBrandSlug(catalogMatch.slug);
        const designContent = await loadBrandDesignMd(catalogMatch.slug);
        if (designContent) {
          setActiveBrand(catalogMatch.slug, designContent);
          toast.success(`${catalogMatch.name} design system loaded`);
        }
      }
    } catch {
      toast.error("Couldn't analyse that URL");
    } finally {
      setLoading(false);
    }
  }

  function useDNA() {
    if (!dna) return;
    onPrompt(dna.promptSuggestion);
    onClose();
  }

  const matchedBrand = matchedBrandSlug ? getBrandBySlug(matchedBrandSlug) : null;

  return (
    <div className="mx-3 mb-2 rounded-xl border border-blue-500/30 bg-blue-500/5 p-3 space-y-2 text-[11px]">
      <div className="flex items-center gap-1.5 text-blue-400 font-medium">
        <Globe className="w-3.5 h-3.5" />
        <span>Reverse Engineer a Website</span>
        <button
          onClick={onClose}
          className="ml-auto p-0.5 rounded hover:bg-blue-500/20 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="stripe.com, vercel.com, ..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void analyse()}
          className="h-7 text-[11px] bg-background/60"
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => void analyse()}
          disabled={loading || !url.trim()}
          className="h-7 px-2.5 shrink-0"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <span>Analyse</span>
          )}
        </Button>
      </div>

      {dna && (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground">{dna.title}</span>
            {matchedBrand && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/15 text-primary border border-primary/30">
                <Sparkles className="w-2.5 h-2.5" />
                {matchedBrand.name} design loaded
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {dna.palette.slice(0, 6).map((c) => (
              <span
                key={c}
                className="w-4 h-4 rounded-full border border-border inline-block shrink-0"
                style={{ background: c }}
                title={c}
              />
            ))}
            <span className="text-muted-foreground ml-1">{dna.mood}</span>
          </div>
          <div className="text-muted-foreground line-clamp-2">{dna.promptSuggestion}</div>
          <Button
            size="sm"
            onClick={useDNA}
            className={cn(
              "h-6 text-[10px] gap-1 w-full",
              "bg-blue-600 hover:bg-blue-500 text-white",
            )}
          >
            <Wand2 className="w-3 h-3" />
            Build this style
          </Button>
        </div>
      )}
    </div>
  );
}
