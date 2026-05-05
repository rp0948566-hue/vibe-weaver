import { useEffect, useState } from "react";
import { FolderOpen, Trash2, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useRaincastStore } from "@/store/raincastStore";
import { buildIframeHtml } from "@/services/iframeBuilder";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ProjectsDrawerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type ProjectRow = {
  id: string;
  title: string;
  updated_at: string;
};

export function ProjectsDrawer({ open, onOpenChange }: ProjectsDrawerProps) {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(false);
  const store = useRaincastStore();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase
      .from("projects")
      .select("id,title,updated_at")
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          toast.error("Couldn't load projects");
        } else {
          setProjects(data ?? []);
        }
        setLoading(false);
      });
  }, [open]);

  const openProject = async (p: ProjectRow) => {
    const [msgsRes, buildRes] = await Promise.all([
      supabase
        .from("messages")
        .select("*")
        .eq("project_id", p.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("builds")
        .select("code, model")
        .eq("project_id", p.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (msgsRes.error) {
      toast.error("Couldn't load messages");
      return;
    }

    store.setActiveProject(p.id, p.title);
    store.setMessages(
      (msgsRes.data ?? []).map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    );
    if (buildRes.data?.code) {
      store.setCode(buildRes.data.code);
      store.setPreviewHtml(buildIframeHtml(buildRes.data.code));
    } else {
      store.setCode("");
      store.setPreviewHtml("");
    }
    onOpenChange(false);
    toast.success(`Opened "${p.title}"`);
  };

  const deleteProject = async (p: ProjectRow, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase.from("projects").delete().eq("id", p.id);
    if (error) {
      toast.error("Couldn't delete");
      return;
    }
    setProjects((ps) => ps.filter((x) => x.id !== p.id));
    if (store.activeProjectId === p.id) store.resetProject();
    toast.success("Deleted");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-panel border-border w-[380px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" /> Your projects
          </SheetTitle>
          <SheetDescription>
            Every prompt auto-saves. Pick one to resume.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-1 max-h-[calc(100vh-140px)] overflow-y-auto raincast-scroll">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No projects yet — build something!
            </p>
          ) : (
            projects.map((p) => (
              <button
                key={p.id}
                onClick={() => openProject(p)}
                className="w-full text-left group px-3 py-2.5 rounded-md hover:bg-secondary transition-colors flex items-start gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(p.updated_at), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => deleteProject(p, e)}
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </button>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
