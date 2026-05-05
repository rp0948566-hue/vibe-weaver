import { create } from "zustand";
import type { ProjectType } from "@/services/codeExtractor";
import type { BrandTokens } from "@/services/design/designTokens";
import type { DesignCritique } from "@/services/design/designCritic";
import { loadBrandTokens } from "@/services/design/designTokens";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type Device = "desktop" | "tablet" | "mobile";
export type AppMode = "build" | "plan";

const LS_SKETCHFAB = "sketchfab_token_legacy"; // kept only to clear old value
const LS_ANTHROPIC = "anthropic_key";
const LS_GEMINI = "raincast_gemini_key";
const LS_FIGMA = "figma_token";
const LS_OPENROUTER = "openrouter_key";
const LS_OLLAMA_URL = "ollama_url";

function readFigmaDefault(): string {
  if (typeof window === "undefined") return "";
  try { return window.localStorage.getItem(LS_FIGMA) ?? ""; } catch { return ""; }
}

export interface DesignSuggestion {
  id: string;
  type: "inconsistency" | "improvement" | "variant";
  message: string;
  autoFixPrompt: string;
  priority: "high" | "medium" | "low";
}

export interface BuildSnapshot {
  id: string;
  version: number;
  html: string;
  prompt: string;
  createdAt: string;
}

// Clear any legacy Sketchfab token from localStorage on load.
if (typeof window !== "undefined") {
  try { window.localStorage.removeItem(LS_SKETCHFAB); } catch { /* ignore */ }
}

function readLS(key: string, fallback = ""): string {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key: string, val: string) {
  if (typeof window === "undefined") return;
  try {
    if (val) window.localStorage.setItem(key, val);
    else window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}


function readAnthropicDefault(): string {
  return readLS(LS_ANTHROPIC, import.meta.env.VITE_ANTHROPIC_KEY ?? "");
}

function readGeminiDefault(): string {
  const HARDCODED = "AIzaSyAeWe3nLLAbd2OzM43GuN8GKnOsk-NHKEk";
  return readLS(LS_GEMINI, import.meta.env.VITE_GEMINI_KEY ?? HARDCODED);
}

function readOpenrouterDefault(): string {
  return readLS(LS_OPENROUTER, "");
}

function readOllamaUrlDefault(): string {
  return readLS(LS_OLLAMA_URL, "http://localhost:11434");
}

interface RaincastState {
  messages: ChatMessage[];
  // Multi-file state
  files: Record<string, string>;
  entryFile: string;
  projectType: ProjectType;
  openTabs: string[];
  activeFile: string | null;
  // Concatenated entry code (for backwards-compat, regenerate, downloads)
  currentCode: string;
  previewHtml: string;
  isBuilding: boolean;
  selectedModel: string;
  activeProjectId: string | null;
  activeProjectTitle: string;
  device: Device;
  previewError: string | null;
  mode: AppMode;
  recentlyChanged: string[];

  anthropicKey: string;
  geminiKey: string;
  openrouterKey: string;
  ollamaUrl: string;
  settingsOpen: boolean;

  // Emergence Engine
  emergenceStats: { totalBuilds: number; topPatterns: Array<{ key: string; category: string; count: number }> } | null;

  // Level 4: active component library selections
  activeComponentNames: string[];

  // Design Intelligence (Levels 1-8)
  figmaToken: string;
  uploadedImage: string | null;
  uploadedImageName: string | null;
  uploadedImageMime: string;
  brandTokens: BrandTokens | null;
  designScore: number | null;
  designCritique: DesignCritique | null;
  designPartnerMode: boolean;
  designSuggestions: DesignSuggestion[];
  buildHistory: BuildSnapshot[];
  showCritiquePanel: boolean;

  // Brand Style System
  activeBrandSlug: string | null;
  activeBrandContext: string | null;

  setMessages: (m: ChatMessage[]) => void;
  addMessage: (m: ChatMessage) => void;
  updateAssistantMessage: (id: string, content: string) => void;
  setCode: (code: string) => void;
  setFiles: (
    files: Record<string, string>,
    entry: string,
    type: ProjectType,
  ) => void;
  openFile: (path: string) => void;
  closeTab: (path: string) => void;
  setActiveFile: (path: string) => void;
  setPreviewHtml: (html: string) => void;
  setBuilding: (v: boolean) => void;
  setModel: (m: string) => void;
  setActiveProject: (id: string | null, title?: string) => void;
  setDevice: (d: Device) => void;
  setPreviewError: (e: string | null) => void;
  setMode: (m: AppMode) => void;
  toggleMode: () => void;
  setRecentlyChanged: (paths: string[]) => void;
  resetProject: () => void;

  setAnthropicKey: (t: string) => void;
  setGeminiKey: (t: string) => void;
  setOpenrouterKey: (t: string) => void;
  setOllamaUrl: (t: string) => void;
  setSettingsOpen: (v: boolean) => void;

  setEmergenceStats: (s: RaincastState["emergenceStats"]) => void;

  // Design Intelligence actions
  setFigmaToken: (t: string) => void;
  setUploadedImage: (img: string | null, name: string | null, mime?: string) => void;
  setBrandTokens: (tokens: BrandTokens | null) => void;
  setDesignScore: (score: number | null) => void;
  setDesignCritique: (c: DesignCritique | null) => void;
  setDesignPartnerMode: (v: boolean) => void;
  addDesignSuggestion: (s: DesignSuggestion) => void;
  dismissSuggestion: (id: string) => void;
  addBuildSnapshot: (snapshot: BuildSnapshot) => void;
  setShowCritiquePanel: (v: boolean) => void;
  setActiveComponentNames: (names: string[]) => void;
  // Brand Style
  setActiveBrand: (slug: string | null, context: string | null) => void;
  clearBrand: () => void;
}

export const useRaincastStore = create<RaincastState>((set) => ({
  messages: [],
  files: {},
  entryFile: "src/App.jsx",
  projectType: "unknown",
  openTabs: [],
  activeFile: null,
  currentCode: "",
  previewHtml: "",
  isBuilding: false,
  selectedModel: "gemini/gemini-2.0-flash",
  activeProjectId: null,
  activeProjectTitle: "Untitled",
  device: "desktop",
  previewError: null,
  mode: "build",
  recentlyChanged: [],

  anthropicKey: readAnthropicDefault(),
  geminiKey: readGeminiDefault(),
  openrouterKey: readOpenrouterDefault(),
  ollamaUrl: readOllamaUrlDefault(),
  settingsOpen: false,
  emergenceStats: null,

  figmaToken: readFigmaDefault(),
  uploadedImage: null,
  uploadedImageName: null,
  uploadedImageMime: "image/png",
  brandTokens: loadBrandTokens(),
  designScore: null,
  designCritique: null,
  designPartnerMode: false,
  designSuggestions: [],
  buildHistory: [],
  showCritiquePanel: false,
  activeComponentNames: [],
  activeBrandSlug: null,
  activeBrandContext: null,

  setMessages: (m) => set({ messages: m }),
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  updateAssistantMessage: (id, content) =>
    set((s) => ({
      messages: s.messages.map((msg) =>
        msg.id === id ? { ...msg, content } : msg,
      ),
    })),
  setCode: (code) => set({ currentCode: code }),
  setFiles: (files, entry, type) =>
    set((s) => {
      const paths = Object.keys(files);
      // Preserve existing tabs that still exist; auto-open entry if nothing.
      const openTabs =
        s.openTabs.filter((t) => paths.includes(t)).length > 0
          ? s.openTabs.filter((t) => paths.includes(t))
          : paths.includes(entry)
            ? [entry]
            : paths.slice(0, 1);
      const activeFile =
        s.activeFile && paths.includes(s.activeFile)
          ? s.activeFile
          : openTabs[0] ?? null;
      return {
        files,
        entryFile: entry,
        projectType: type,
        openTabs,
        activeFile,
        currentCode: files[entry] ?? s.currentCode,
      };
    }),
  openFile: (path) =>
    set((s) => {
      if (!s.files[path]) return {};
      const openTabs = s.openTabs.includes(path)
        ? s.openTabs
        : [...s.openTabs, path];
      return { openTabs, activeFile: path };
    }),
  closeTab: (path) =>
    set((s) => {
      const openTabs = s.openTabs.filter((t) => t !== path);
      let activeFile = s.activeFile;
      if (activeFile === path) {
        activeFile = openTabs[openTabs.length - 1] ?? null;
      }
      return { openTabs, activeFile };
    }),
  setActiveFile: (path) => set({ activeFile: path }),
  setPreviewHtml: (html) => set({ previewHtml: html }),
  setBuilding: (v) => set({ isBuilding: v }),
  setModel: (m) => set({ selectedModel: m }),
  setActiveProject: (id, title) =>
    set({
      activeProjectId: id,
      activeProjectTitle: title ?? "Untitled",
    }),
  setDevice: (d) => set({ device: d }),
  setPreviewError: (e) => set({ previewError: e }),
  setMode: (m) => set({ mode: m }),
  toggleMode: () =>
    set((s) => ({ mode: s.mode === "build" ? "plan" : "build" })),
  setRecentlyChanged: (paths) => set({ recentlyChanged: paths }),
  resetProject: () =>
    set({
      messages: [],
      files: {},
      openTabs: [],
      activeFile: null,
      projectType: "unknown",
      currentCode: "",
      previewHtml: "",
      activeProjectId: null,
      activeProjectTitle: "Untitled",
      previewError: null,
    }),
  setAnthropicKey: (t) => {
    writeLS(LS_ANTHROPIC, t);
    set({ anthropicKey: t });
  },
  setGeminiKey: (t) => {
    writeLS(LS_GEMINI, t);
    set({ geminiKey: t });
  },
  setOpenrouterKey: (t) => {
    writeLS(LS_OPENROUTER, t);
    set({ openrouterKey: t });
  },
  setOllamaUrl: (t) => {
    writeLS(LS_OLLAMA_URL, t);
    set({ ollamaUrl: t });
  },
  setSettingsOpen: (v) => set({ settingsOpen: v }),
  setEmergenceStats: (s) => set({ emergenceStats: s }),

  setFigmaToken: (t) => {
    try { if (t) localStorage.setItem(LS_FIGMA, t); else localStorage.removeItem(LS_FIGMA); } catch { /* ignore */ }
    set({ figmaToken: t });
  },
  setUploadedImage: (img, name, mime = "image/png") =>
    set({ uploadedImage: img, uploadedImageName: name, uploadedImageMime: mime }),
  setBrandTokens: (tokens) => set({ brandTokens: tokens }),
  setDesignScore: (score) => set({ designScore: score }),
  setDesignCritique: (c) => set({ designCritique: c }),
  setDesignPartnerMode: (v) => set({ designPartnerMode: v }),
  addDesignSuggestion: (s) =>
    set((st) => ({ designSuggestions: [...st.designSuggestions, s] })),
  dismissSuggestion: (id) =>
    set((st) => ({ designSuggestions: st.designSuggestions.filter((s) => s.id !== id) })),
  addBuildSnapshot: (snapshot) =>
    set((st) => ({ buildHistory: [...st.buildHistory.slice(-9), snapshot] })),
  setShowCritiquePanel: (v) => set({ showCritiquePanel: v }),
  setActiveComponentNames: (names) => set({ activeComponentNames: names }),
  setActiveBrand: (slug, context) => set({ activeBrandSlug: slug, activeBrandContext: context }),
  clearBrand: () => set({ activeBrandSlug: null, activeBrandContext: null }),
}));
