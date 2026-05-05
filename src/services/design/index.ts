/*
 * RAINCAST DESIGN INTELLIGENCE SYSTEM
 * =====================================
 *
 * Level 1 — Screenshot / Image to Code
 *   imageAnalyzer.ts → prepareImageMessage() → multimodal ChatMessage
 *   PromptInput.tsx  → file picker + drag-drop + base64 store
 *   useAIBuild.ts    → attach image to outgoing message, clear after build
 *
 * Level 2 — Figma URL to Code
 *   figmaService.ts  → isFigmaUrl() → parseFigmaUrl() → extractDesignTokens()
 *                    → getFigmaFrameImage() → buildFigmaToCodePrompt()
 *   ChatPanel.tsx    → detects Figma URL on send → fetches tokens + image → augments message
 *   SettingsModal    → Figma personal access token field
 *
 * Level 3 — Design Token System (Brand Identity)
 *   designTokens.ts  → BrandTokens → buildBrandContext() → injected into every build
 *   BrandSetupPanel  → color pickers, font inputs, aesthetic selector
 *   SettingsModal    → "Design Intelligence" section with brand setup
 *   useAIBuild.ts    → injects brand context before build stream
 *
 * Level 4 — Component Library Scanner
 *   componentScanner.ts → scanZipFile() → ScannedComponent[]
 *                       → buildComponentLibraryPrompt() → injected into builds
 *   ChatPanel.tsx       → ZIP upload entry point
 *
 * Level 5 — Design Critic
 *   designCritic.ts  → runDesignCritic() → DesignCritique (background AI call)
 *   DesignScoreWidget → score badge in preview toolbar
 *   DesignCritiquePanel → full critique view with auto-fix button
 *   useAIBuild.ts    → runs critic silently after every build
 *
 * Level 6 — Design System Generator
 *   designSystemGenerator.ts → isDesignSystemRequest() → buildDesignSystemPrompt()
 *   ChatPanel.tsx            → "Generate Design System" prompt chip
 *   useAIBuild.ts            → intercepts trigger → augments prompt
 *
 * Level 7 — Design Evolution Tracker
 *   raincastStore.ts → buildHistory: BuildSnapshot[] → addBuildSnapshot()
 *   EvolutionTracker → version timeline with iframe thumbnails + restore
 *   useAIBuild.ts    → addBuildSnapshot() after every build
 *
 * Level 8 — AI Design Partner Mode
 *   raincastStore.ts    → designPartnerMode, designSuggestions
 *   TopBar.tsx          → Partner Mode toggle
 *   DesignSuggestionToast → dismissable floating suggestion cards
 *   useAIBuild.ts       → analyzes built code for inconsistencies when mode is on
 *
 * DATA FLOW:
 *   User Input → [L1 image?] → [L2 Figma?] → [L6 design system?]
 *     → [L3 inject brand] → [L4 inject components] → [L8 partner context]
 *     → streamAIBuild() → onDone:
 *       → [L7 snapshot] → [L5 critic] → [L8 suggestions] → store
 */

export { IMAGE_ANALYSIS_PROMPT, prepareImageMessage, fileToBase64 } from "./imageAnalyzer";
export { isFigmaUrl, parseFigmaUrl, extractDesignTokens, getFigmaFrameImage, buildFigmaToCodePrompt } from "./figmaService";
export type { DesignTokens, FigmaNode } from "./figmaService";
export { DEFAULT_BRAND, AESTHETICS, saveBrandTokens, loadBrandTokens, buildBrandContext } from "./designTokens";
export type { BrandTokens } from "./designTokens";
export { scanZipFile, buildComponentLibraryPrompt, saveScannedComponents, loadScannedComponents } from "./componentScanner";
export type { ScannedComponent } from "./componentScanner";
export { DESIGN_CRITIC_PROMPT, runDesignCritic, getScoreColor, getScoreDot } from "./designCritic";
export type { DesignCritique, DesignCritiqueCategory } from "./designCritic";
export { isDesignSystemRequest, buildDesignSystemPrompt } from "./designSystemGenerator";
