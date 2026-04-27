import { create } from "zustand";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type Device = "desktop" | "tablet" | "mobile";

interface RaincastState {
  messages: ChatMessage[];
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
      currentCode: "",
      previewHtml: "",
      activeProjectId: null,
      activeProjectTitle: "Untitled",
      previewError: null,
    }),
}));
