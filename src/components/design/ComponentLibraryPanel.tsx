import { useRef, useState } from "react";
import { Upload, Package, Check, Trash2, ChevronRight } from "lucide-react";
import {
  scanZipFile,
  saveScannedComponents,
  loadScannedComponents,
  type ScannedComponent,
} from "@/services/design/componentScanner";
import { useRaincastStore } from "@/store/raincastStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ComponentLibraryPanel() {
  const setActiveComponentNames = useRaincastStore((s) => s.setActiveComponentNames);
  const [components, setComponents] = useState<ScannedComponent[]>(() => loadScannedComponents());
  const [active, setActive] = useState<Set<string>>(() => new Set());
  const [scanning, setScanning] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleZip = async (file: File) => {
    if (!file.name.endsWith(".zip")) {
      toast.error("Upload a .zip file containing your components");
      return;
    }
    setScanning(true);
    try {
      const found = await scanZipFile(file);
      if (!found.length) {
        toast.error("No React components found in ZIP");
        return;
      }
      const merged = [...components];
      for (const c of found) {
        if (!merged.find((m) => m.name === c.name)) merged.push(c);
      }
      setComponents(merged);
      saveScannedComponents(merged);
      toast.success(`${found.length} component${found.length !== 1 ? "s" : ""} scanned`);
    } catch {
      toast.error("Failed to scan ZIP");
    } finally {
      setScanning(false);
    }
  };

  const toggleActive = (name: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      setActiveComponentNames(Array.from(next));
      return next;
    });
  };

  const clearAll = () => {
    setComponents([]);
    setActive(new Set());
    setActiveComponentNames([]);
    saveScannedComponents([]);
    toast.success("Component library cleared");
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a24]">
      <div className="px-3 py-2 border-b border-[#1e1e2e] flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.16em] text-[#6b6b85] font-medium">
          My Components
        </span>
        {components.length > 0 && (
          <button
            onClick={clearAll}
            title="Clear library"
            className="text-[#5a5a75] hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto raincast-scroll">
        {components.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Package className="w-6 h-6 text-[#3a3a52] mx-auto mb-3" />
            <p className="text-[11px] text-[#5a5a75] leading-relaxed">
              Upload a .zip of your component library to reference it in builds.
            </p>
          </div>
        ) : (
          <div className="py-1">
            {components.map((c) => {
              const isOn = active.has(c.name);
              const isOpen = expanded === c.name;
              return (
                <div key={c.name} className="border-b border-[#1e1e2e]/60 last:border-0">
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
                      isOn ? "bg-primary/10" : "hover:bg-white/[0.03]",
                    )}
                  >
                    <button
                      onClick={() => toggleActive(c.name)}
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all",
                        isOn
                          ? "bg-primary border-primary"
                          : "border-[#3a3a52] hover:border-primary/60",
                      )}
                      title={isOn ? "Remove from builds" : "Use in next build"}
                    >
                      {isOn && <Check className="w-2.5 h-2.5 text-black" />}
                    </button>

                    <div
                      className="flex-1 min-w-0 flex items-center gap-1"
                      onClick={() => setExpanded(isOpen ? null : c.name)}
                    >
                      <span className={cn("text-[12px] truncate", isOn ? "text-primary" : "text-[#a0a0b8]")}>
                        {c.name}
                      </span>
                      <ChevronRight
                        className={cn(
                          "w-3 h-3 shrink-0 text-[#5a5a75] transition-transform",
                          isOpen && "rotate-90",
                        )}
                      />
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-3 pb-2">
                      <p className="text-[10px] text-[#6b6b85] mb-1">{c.description}</p>
                      <div className="font-mono text-[10px] text-[#8080a0] bg-[#0f0f17] rounded px-2 py-1 truncate">
                        {"{ " + c.propsSignature + " }"}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-[#1e1e2e]">
        <input
          ref={fileRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleZip(f);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={scanning}
          className="w-full flex items-center justify-center gap-2 text-[11px] py-2 rounded-md border border-[#2a2a3a] text-[#8080a0] hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" />
          {scanning ? "Scanning…" : "Upload component .zip"}
        </button>
        {active.size > 0 && (
          <p className="text-center text-[10px] text-primary mt-1.5">
            {active.size} component{active.size !== 1 ? "s" : ""} active in builds
          </p>
        )}
      </div>
    </div>
  );
}
