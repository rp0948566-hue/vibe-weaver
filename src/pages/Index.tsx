import { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TopBar } from "@/components/layout/TopBar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { CodeViewer } from "@/components/code/CodeViewer";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import { ProjectsDrawer } from "@/components/layout/ProjectsDrawer";
import { SettingsModal } from "@/components/layout/SettingsModal";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { Loader2, MessageSquare, Code2, Play } from "lucide-react";

export default function Index() {
  const { user, guest, hasAccess, loading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  useGlobalShortcuts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <TopBar
        onOpenProjects={() => setDrawerOpen(true)}
        userEmail={user?.email ?? (guest ? "Guest" : null)}
        isGuest={guest && !user}
      />
      <div className="flex-1 min-h-0 p-2">
        {isMobile ? (
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 h-9 shrink-0">
              <TabsTrigger value="chat" className="text-xs gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="code" className="text-xs gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                Code
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs gap-1.5">
                <Play className="w-3.5 h-3.5" />
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="flex-1 min-h-0 mt-2">
              <div className="h-full raincast-panel overflow-hidden">
                <ChatPanel />
              </div>
            </TabsContent>
            <TabsContent value="code" className="flex-1 min-h-0 mt-2">
              <div className="h-full raincast-panel overflow-hidden bg-[#111118]">
                <CodeViewer />
              </div>
            </TabsContent>
            <TabsContent value="preview" className="flex-1 min-h-0 mt-2">
              <PreviewPanel />
            </TabsContent>
          </Tabs>
        ) : (
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
            <ResizablePanel defaultSize={45} minSize={25} className="px-1">
              <div className="h-full raincast-panel overflow-hidden bg-[#111118]">
                <CodeViewer />
              </div>
            </ResizablePanel>
            <ResizableHandle className="bg-transparent w-1" />
            <ResizablePanel defaultSize={30} minSize={20} className="pl-1">
              <PreviewPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      <ProjectsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
      <SettingsModal />
    </div>
  );
}
