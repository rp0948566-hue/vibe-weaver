import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRaincastStore } from "@/store/raincastStore";
import { streamAIBuild, type ChatMessage } from "@/services/aiRouter";
import { extractFiles } from "@/services/codeExtractor";
import { buildIframeHtmlFromFiles } from "@/services/iframeBuilder";
import { toast } from "sonner";

const BUILD_KEYWORDS = [
  "build",
  "make",
  "create",
  "add",
  "change",
  "fix",
  "update",
  "remove",
  "delete",
  "generate",
  "implement",
  "refactor",
  "redesign",
  "rebuild",
  "regenerate",
  "replace",
  "include",
  "improve",
  "convert",
  "turn into",
  "swap",
  "rename",
];

const PLAN_BUILD_TRIGGERS = [
  "build it",
  "build this",
  "let's build",
  "lets build",
  "go ahead",
  "start building",
  "ship it",
  "do it",
  "make it",
];

function isBuildRequest(text: string): boolean {
  const t = text.toLowerCase();
  return BUILD_KEYWORDS.some(
    (k) => t === k || t.startsWith(k + " ") || t.includes(" " + k + " "),
  );
}

function isPlanBuildTrigger(text: string): boolean {
  const t = text.toLowerCase().trim();
  return PLAN_BUILD_TRIGGERS.some((k) => t === k || t.startsWith(k));
}

export function useAIBuild() {
  const store = useRaincastStore();

  const ensureProject = useCallback(
    async (userId: string, firstPrompt: string): Promise<string | null> => {
      if (store.activeProjectId) return store.activeProjectId;
      const title = firstPrompt.slice(0, 60) || "Untitled";
      const { data, error } = await supabase
        .from("projects")
        .insert({ user_id: userId, title })
        .select()
        .single();
      if (error) {
        console.error("createProject", error);
        toast.error("Couldn't create project");
        return null;
      }
      store.setActiveProject(data.id, data.title);
      return data.id;
    },
    [store],
  );

  const send = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || store.isBuilding) return;

      const state = useRaincastStore.getState();
      const currentMode = state.mode;
      const hasFiles = Object.keys(state.files).length > 0;

      // Decide effective request mode
      let requestMode: "build" | "chat" | "plan" = "build";
      if (currentMode === "plan") {
        // Plan mode: trigger build if user explicitly says so
        if (isPlanBuildTrigger(prompt)) {
          requestMode = "build";
          state.setMode("build");
        } else {
          requestMode = "plan";
        }
      } else {
        // Build mode: chat vs build heuristic. Only treat as chat if we have
        // an existing project and the message clearly isn't a build request.
        if (hasFiles && !isBuildRequest(prompt)) {
          requestMode = "chat";
        } else {
          requestMode = "build";
        }
      }

      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id ?? null;
      const projectId =
        userId && requestMode === "build"
          ? await ensureProject(userId, prompt)
          : userId
            ? state.activeProjectId
            : null;

      const userMsg = {
        id: crypto.randomUUID(),
        role: "user" as const,
        content: prompt,
      };
      const asstId = crypto.randomUUID();
      const asstMsg = {
        id: asstId,
        role: "assistant" as const,
        content: "",
      };
      store.addMessage(userMsg);
      store.addMessage(asstMsg);
      store.setBuilding(true);
      store.setPreviewError(null);

      if (userId && projectId) {
        supabase
          .from("messages")
          .insert({
            project_id: projectId,
            user_id: userId,
            role: "user",
            content: prompt,
          })
          .then(({ error }) => {
            if (error) console.warn("persist user msg", error);
          });
      }

      // Send only the last 10 messages for context (excluding the empty assistant)
      const history: ChatMessage[] = useRaincastStore
        .getState()
        .messages.filter((m) => m.id !== asstId)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      let accumulated = "";
      const previousFiles = { ...state.files };

      await streamAIBuild({
        messages: history,
        model: store.selectedModel,
        currentCode: requestMode === "build" ? store.currentCode || undefined : store.currentCode || undefined,
        mode: requestMode,
        onDelta: (chunk) => {
          accumulated += chunk;
          useRaincastStore.getState().updateAssistantMessage(asstId, accumulated);
          if (requestMode === "build") {
            const { files, entry, type } = extractFiles(accumulated);
            if (Object.keys(files).length > 0) {
              useRaincastStore.getState().setFiles(files, entry, type);
            }
          }
        },
        onDone: () => {
          if (requestMode === "build") {
            const { files, entry, type } = extractFiles(accumulated);
            const finalCode = files[entry] ?? Object.values(files)[0] ?? "";
            if (finalCode && Object.keys(files).length > 0) {
              useRaincastStore.getState().setFiles(files, entry, type);
              useRaincastStore
                .getState()
                .setPreviewHtml(buildIframeHtmlFromFiles(files, entry));

              // Track which files changed
              const changed = Object.keys(files).filter(
                (p) => previousFiles[p] !== files[p],
              );
              useRaincastStore.getState().setRecentlyChanged(changed);
              window.setTimeout(() => {
                useRaincastStore.getState().setRecentlyChanged([]);
              }, 4000);

              if (userId && projectId) {
                supabase
                  .from("messages")
                  .insert({
                    project_id: projectId,
                    user_id: userId,
                    role: "assistant",
                    content: accumulated,
                  })
                  .then(({ error }) => {
                    if (error) console.warn("persist assistant msg", error);
                  });
                supabase
                  .from("builds")
                  .insert({
                    project_id: projectId,
                    user_id: userId,
                    code: finalCode,
                    model: store.selectedModel,
                  })
                  .then(({ error }) => {
                    if (error) console.warn("persist build", error);
                  });
              }
              toast.success("Build ready");
            } else {
              toast.error("AI didn't return any code. Try again.");
            }
          } else if (requestMode === "plan") {
            toast.success("Plan updated");
          }
          // chat: nothing extra to do
          useRaincastStore.getState().setBuilding(false);
        },
        onError: (e) => {
          useRaincastStore.getState().setBuilding(false);
          if (e.status === 429) toast.error("Rate limit reached. Wait a sec.");
          else if (e.status === 402)
            toast.error("AI credits exhausted. Add credits in Workspace → Usage.");
          else toast.error(e.message || "AI build failed");
        },
      });
    },
    [ensureProject, store],
  );

  const regenerate = useCallback(async () => {
    const msgs = useRaincastStore.getState().messages;
    const lastUser = [...msgs].reverse().find((m) => m.role === "user");
    if (!lastUser) {
      toast.error("Nothing to regenerate");
      return;
    }
    const filtered = msgs.filter(
      (m, i) => !(m.role === "assistant" && i === msgs.length - 1),
    );
    useRaincastStore.getState().setMessages(filtered);
    await send(lastUser.content);
  }, [send]);

  const buildFromPlan = useCallback(
    async (planSummary: string) => {
      // Switch to build mode and send a directive
      useRaincastStore.getState().setMode("build");
      const prompt = `Build the project based on this agreed plan:\n\n${planSummary}\n\nGenerate the complete multi-file project now.`;
      await send(prompt);
    },
    [send],
  );

  return { send, regenerate, buildFromPlan };
}
