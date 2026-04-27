import { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TopBar } from "@/components/layout/TopBar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { CodeViewer } from "@/components/code/CodeViewer";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import { ProjectsDrawer } from "@/components/layout/ProjectsDrawer";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function Index() {
  const { user, loading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <TopBar
        onOpenProjects={() => setDrawerOpen(true)}
        userEmail={user.email}
      />
      <div className="flex-1 min-h-0 p-2">
        <ResizablePanelGroup
          direction="horizontal"
          className="rounded-md overflow-hidden"
        >
          <ResizablePanel defaultSize={25} minSize={18} className="pr-1">
            <div className="h-full raincast-panel overflow-hidden">
              <ChatPanel />
            </div>
          </ResizablePanel>
          <ResizableHandle className="bg-transparent w-1" />
          <ResizablePanel defaultSize={40} minSize={20} className="px-1">
            <div className="h-full raincast-panel overflow-hidden">
              <CodeViewer />
            </div>
          </ResizablePanel>
          <ResizableHandle className="bg-transparent w-1" />
          <ResizablePanel defaultSize={35} minSize={20} className="pl-1">
            <PreviewPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <ProjectsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
