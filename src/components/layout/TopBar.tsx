import { Plus, FolderOpen, LogOut, UserRound, Settings, Download, Cpu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRaincastStore } from "@/store/raincastStore";
import { AVAILABLE_MODELS } from "@/services/aiRouter";
import { exportAndDownload } from "@/services/projectExporter";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { disableGuestMode } from "@/hooks/useAuth";
import { toast } from "sonner";

interface TopBarProps {
  onOpenProjects: () => void;
  userEmail?: string | null;
  isGuest?: boolean;
}

export function TopBar({ onOpenProjects, userEmail, isGuest }: TopBarProps) {
  const navigate = useNavigate();
  const selectedModel = useRaincastStore((s) => s.selectedModel);
  const setModel = useRaincastStore((s) => s.setModel);
  const resetProject = useRaincastStore((s) => s.resetProject);
  const title = useRaincastStore((s) => s.activeProjectTitle);
  const isBuilding = useRaincastStore((s) => s.isBuilding);
  const setSettingsOpen = useRaincastStore((s) => s.setSettingsOpen);
  const designPartnerMode = useRaincastStore((s) => s.designPartnerMode);
  const setDesignPartnerMode = useRaincastStore((s) => s.setDesignPartnerMode);
  const files = useRaincastStore((s) => s.files);
  const entryFile = useRaincastStore((s) => s.entryFile);
  const previewHtml = useRaincastStore((s) => s.previewHtml);

  const hasBuild = Object.keys(files).length > 0;

  const handleExport = async () => {
    if (!hasBuild) {
      toast.error("Nothing to export yet");
      return;
    }
    try {
      await exportAndDownload({
        files,
        entry: entryFile,
        previewHtml,
        projectTitle: title,
      });
      toast.success("Project downloaded");
    } catch (e) {
      console.error("export failed", e);
      toast.error("Export failed");
    }
  };

  const signOut = async () => {
    if (isGuest) {
      disableGuestMode();
      navigate("/auth");
      return;
    }
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  return (
    <header className="h-12 shrink-0 border-b border-border bg-panel/80 backdrop-blur-xl flex items-center px-3 gap-3 relative z-20">
      {/* Logo */}
      <div className="flex items-center gap-2.5 pr-3 border-r border-border h-full">
        <div className="relative w-6 h-6 rounded-md raincast-orb" />
        <span className="font-display text-lg tracking-tight leading-none">
          RAIN<span className="italic text-primary">CAST</span>
        </span>
      </div>

      {/* Project title + status */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="text-sm text-foreground/90 truncate max-w-[240px] font-medium">
          {title}
        </div>
        {isBuilding ? (
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Building
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Ready
          </span>
        )}
        {isGuest && (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
            Guest
          </span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Select value={selectedModel} onValueChange={setModel}>
          <SelectTrigger className="h-8 w-[200px] bg-secondary/70 border-border text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_MODELS.map((m) => (
              <SelectItem key={m.id} value={m.id} className="text-xs">
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="sm"
          variant="ghost"
          onClick={resetProject}
          className="h-8 gap-1.5 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          New
        </Button>

        {!isGuest && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenProjects}
            className="h-8 gap-1.5 text-xs"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Projects
          </Button>
        )}

        {isGuest && (
          <Button
            size="sm"
            onClick={() => {
              disableGuestMode();
              navigate("/auth");
            }}
            className="h-8 gap-1.5 text-xs shadow-[var(--shadow-glow)]"
          >
            <UserRound className="w-3.5 h-3.5" />
            Sign in to save
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={handleExport}
          disabled={!hasBuild}
          className="h-8 gap-1.5 text-xs"
          title="Export project as ZIP (Ctrl+S)"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setDesignPartnerMode(!designPartnerMode)}
          className={`h-8 gap-1.5 text-xs ${designPartnerMode ? "text-primary bg-primary/10" : ""}`}
          title="Design Partner Mode — AI proactively improves your design"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Partner</span>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setSettingsOpen(true)}
          className="h-8 w-8"
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </Button>

        <div className="h-5 w-px bg-border mx-1" />

        <span className="text-xs text-muted-foreground hidden md:inline max-w-[140px] truncate">
          {userEmail}
        </span>
        <Button
          size="icon"
          variant="ghost"
          onClick={signOut}
          className="h-8 w-8"
          title={isGuest ? "Exit guest" : "Sign out"}
        >
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    </header>
  );
}
