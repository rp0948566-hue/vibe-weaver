import { Zap, Plus, FolderOpen, LogOut, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRaincastStore } from "@/store/raincastStore";
import { AVAILABLE_MODELS } from "@/services/aiRouter";
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
    <header className="h-12 shrink-0 border-b border-border bg-panel flex items-center px-3 gap-3">
      <div className="flex items-center gap-2 pr-3 border-r border-border h-full">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold tracking-tight">RAINCAST</span>
      </div>

      <div className="text-sm text-muted-foreground truncate max-w-[240px]">
        {title}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Select value={selectedModel} onValueChange={setModel}>
          <SelectTrigger className="h-8 w-[220px] bg-secondary border-border text-xs">
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
          className="h-8 gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={onOpenProjects}
          className="h-8 gap-1.5"
        >
          <FolderOpen className="w-4 h-4" />
          Projects
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        <span className="text-xs text-muted-foreground hidden sm:inline">
          {userEmail}
        </span>
        <Button size="sm" variant="ghost" onClick={signOut} className="h-8">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
