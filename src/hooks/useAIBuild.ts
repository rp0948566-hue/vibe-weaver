import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRaincastStore } from "@/store/raincastStore";
import { streamAIBuild, type ChatMessage } from "@/services/aiRouter";
import { extractCode, extractPartialCode } from "@/services/codeExtractor";
import { buildIframeHtml } from "@/services/iframeBuilder";
import { toast } from "sonner";

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

      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id ?? null;
      // Guest mode: no userId → skip persistence but still run the build
      const projectId = userId ? await ensureProject(userId, prompt) : null;

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

      const history: ChatMessage[] = useRaincastStore
        .getState()
        .messages.filter((m) => m.id !== asstId)
        .map((m) => ({ role: m.role, content: m.content }));

      let accumulated = "";

      await streamAIBuild({
        messages: history,
        model: store.selectedModel,
        currentCode: store.currentCode || undefined,
        onDelta: (chunk) => {
          accumulated += chunk;
          useRaincastStore
            .getState()
            .updateAssistantMessage(asstId, accumulated);
          const partial = extractPartialCode(accumulated);
          if (partial && partial.length > 40) {
            useRaincastStore.getState().setCode(partial);
          }
        },
        onDone: () => {
          const finalCode = extractCode(accumulated);
          if (finalCode) {
            useRaincastStore.getState().setCode(finalCode);
            useRaincastStore
              .getState()
              .setPreviewHtml(buildIframeHtml(finalCode));

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
    // Re-send the last user message
    const msgs = useRaincastStore.getState().messages;
    const lastUser = [...msgs].reverse().find((m) => m.role === "user");
    if (!lastUser) {
      toast.error("Nothing to regenerate");
      return;
    }
    // Remove the last assistant message
    const filtered = msgs.filter(
      (m, i) =>
        !(m.role === "assistant" && i === msgs.length - 1),
    );
    useRaincastStore.getState().setMessages(filtered);
    await send(lastUser.content);
  }, [send]);

  return { send, regenerate };
}
