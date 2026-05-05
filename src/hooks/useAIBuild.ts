import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRaincastStore } from "@/store/raincastStore";
import { streamAIBuild, type ChatMessage } from "@/services/aiRouter";
import { extractFiles } from "@/services/codeExtractor";
import { buildIframeHtmlFromFiles } from "@/services/iframeBuilder";
import { buildBrandInjectionMessage } from "@/services/design/designMdLoader";
import {
  saveBuildMemory,
  getRecentBuilds,
  getEmergenceStats,
  computeFingerprint,
  loadFingerprint,
  persistFingerprint,
  injectEmergenceContext,
} from "@/services/emergence";
import { prepareImageMessage } from "@/services/design/imageAnalyzer";
import { buildBrandContext } from "@/services/design/designTokens";
import { runDesignCritic } from "@/services/design/designCritic";
import { loadScannedComponents, buildComponentLibraryPrompt } from "@/services/design/componentScanner";
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

  const runAIStream = useCallback(
    async (args: {
      prompt: string;
      asstId: string;
      userId: string | null;
      projectId: string | null;
      history: ChatMessage[];
      requestMode: "build" | "chat" | "plan";
    }) => {
      const { prompt, asstId, userId, projectId, history, requestMode } = args;
      const state = useRaincastStore.getState();
      const previousFiles = { ...state.files };
      let accumulated = "";

      // Emergence: inject fingerprint context before build
      let enrichedHistory = history;
      if (requestMode === "build" && userId) {
        const fp = await loadFingerprint(userId);
        enrichedHistory = injectEmergenceContext(history, fp);
      }

      // Level 1: Inject uploaded image into last user message
      const stateSnap = useRaincastStore.getState();
      if (requestMode === "build" && stateSnap.uploadedImage) {
        const imgMsg = prepareImageMessage(
          stateSnap.uploadedImage,
          stateSnap.uploadedImageMime,
          prompt,
        );
        const idx = [...enrichedHistory].reverse().findIndex((m) => m.role === "user");
        if (idx !== -1) {
          const realIdx = enrichedHistory.length - 1 - idx;
          enrichedHistory = [
            ...enrichedHistory.slice(0, realIdx),
            imgMsg,
            ...enrichedHistory.slice(realIdx + 1),
          ];
        }
      }

      // Level 2.5: Inject active brand DESIGN.md context (overrides universal defaults)
      if (requestMode === "build" && stateSnap.activeBrandContext && stateSnap.activeBrandSlug) {
        const brandMsg: ChatMessage = {
          role: "user",
          content: buildBrandInjectionMessage(stateSnap.activeBrandSlug, stateSnap.activeBrandContext),
        };
        enrichedHistory = [brandMsg, ...enrichedHistory];
      }

      // Level 3: Inject brand tokens
      if (requestMode === "build" && stateSnap.brandTokens) {
        const brandMsg: ChatMessage = {
          role: "user",
          content: buildBrandContext(stateSnap.brandTokens),
        };
        enrichedHistory = [brandMsg, ...enrichedHistory];
      }

      // Level 4: Inject active component library
      if (requestMode === "build" && stateSnap.activeComponentNames.length > 0) {
        const allComponents = loadScannedComponents();
        const active = allComponents.filter((c) =>
          stateSnap.activeComponentNames.includes(c.name),
        );
        if (active.length > 0) {
          const compMsg: ChatMessage = {
            role: "user",
            content: buildComponentLibraryPrompt(active),
          };
          enrichedHistory = [compMsg, ...enrichedHistory];
        }
      }

      await streamAIBuild({
        messages: enrichedHistory,
        model: state.selectedModel,
        currentCode: state.currentCode || undefined,
        mode: requestMode,
        keys: {
          openrouter: state.openrouterKey,
          ollamaUrl: state.ollamaUrl,
          geminiApiKey: state.geminiKey,
        },
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
              const html = buildIframeHtmlFromFiles(files, entry, useRaincastStore.getState().activeBrandSlug ?? undefined);
              useRaincastStore.getState().setPreviewHtml(html);

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
                    model: state.selectedModel,
                  })
                  .then(({ error }) => {
                    if (error) console.warn("persist build", error);
                  });

                // Emergence: save memory + refresh fingerprint
                void (async () => {
                  await saveBuildMemory({
                    userId,
                    projectId,
                    prompt,
                    code: finalCode,
                    model: state.selectedModel,
                  });
                  const recentBuilds = await getRecentBuilds(userId, 30);
                  const fp = computeFingerprint(recentBuilds);
                  await persistFingerprint(userId, fp);
                  const stats = await getEmergenceStats(userId);
                  useRaincastStore.getState().setEmergenceStats(stats);
                })();

                // Level 7: Save build snapshot for evolution tracker
                const version = useRaincastStore.getState().buildHistory.length + 1;
                useRaincastStore.getState().addBuildSnapshot({
                  id: crypto.randomUUID(),
                  version,
                  html,
                  prompt,
                  createdAt: new Date().toISOString(),
                });
              }
              toast.success("Build ready");

              // Level 1: Clear uploaded image after successful build
              useRaincastStore.getState().setUploadedImage(null, null);

              // Level 5: Design Critic (silent background analysis)
              void (async () => {
                const critique = await runDesignCritic(finalCode, state.selectedModel);
                if (critique) {
                  useRaincastStore.getState().setDesignScore(critique.score);
                  useRaincastStore.getState().setDesignCritique(critique);

                  // Level 8: Design Partner Mode — generate suggestions
                  const partnerMode = useRaincastStore.getState().designPartnerMode;
                  if (partnerMode && critique.topIssues.length > 0) {
                    critique.topIssues.slice(0, 2).forEach((issue, i) => {
                      useRaincastStore.getState().addDesignSuggestion({
                        id: crypto.randomUUID(),
                        type: i === 0 ? "improvement" : "inconsistency",
                        message: issue,
                        autoFixPrompt: `Fix this design issue in the current build: ${issue}`,
                        priority: critique.score < 6 ? "high" : "medium",
                      });
                    });
                  }
                }
              })();
            } else {
              toast.error("AI didn't return any code. Try again.");
            }
          } else if (requestMode === "plan") {
            toast.success("Plan updated");
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

      void prompt;
    },
    [],
  );

  const send = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || store.isBuilding) return;

      const state = useRaincastStore.getState();
      const currentMode = state.mode;
      const hasFiles = Object.keys(state.files).length > 0;

      let requestMode: "build" | "chat" | "plan" = "build";
      if (currentMode === "plan") {
        if (isPlanBuildTrigger(prompt)) {
          requestMode = "build";
          state.setMode("build");
        } else {
          requestMode = "plan";
        }
      } else {
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

      const history: ChatMessage[] = useRaincastStore
        .getState()
        .messages.filter((m) => m.id !== asstId)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      await runAIStream({
        prompt,
        asstId,
        userId,
        projectId,
        history,
        requestMode,
      });
    },
    [ensureProject, store, runAIStream],
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
      useRaincastStore.getState().setMode("build");
      const prompt = `Build the project based on this agreed plan:\n\n${planSummary}\n\nGenerate the complete multi-file project now.`;
      await send(prompt);
    },
    [send],
  );

  return { send, regenerate, buildFromPlan };
}
