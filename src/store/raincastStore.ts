import { create } from "zustand";
import type { ProjectType } from "@/services/codeExtractor";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type Device = "desktop" | "tablet" | "mobile";
export type AppMode = "build" | "plan";

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
  resetProject: () => void;
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
  selectedModel: "google/gemini-3-flash-preview",
  activeProjectId: null,
  activeProjectTitle: "Untitled",
  device: "desktop",
  previewError: null,

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
}));
