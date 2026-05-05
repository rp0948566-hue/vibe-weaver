# VIBE WEAVER — PLATFORM BLUEPRINT

> Complete technical architecture, file map, data flows, and design decisions.
> Every layer explained from first principles.

---

## TABLE OF CONTENTS

1. [What This Platform Is](#1-what-this-platform-is)
2. [Technology Stack](#2-technology-stack)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Repository File Map](#4-repository-file-map)
5. [Data Flow: Full Build Lifecycle](#5-data-flow-full-build-lifecycle)
6. [AI Pipeline Deep Dive](#6-ai-pipeline-deep-dive)
7. [Code Extraction & Bundling Pipeline](#7-code-extraction--bundling-pipeline)
8. [Brand Intelligence System](#8-brand-intelligence-system)
9. [Emergence Engine (Style Memory)](#9-emergence-engine-style-memory)
10. [Preview Sandbox System](#10-preview-sandbox-system)
11. [Market Research & Auto Reverse-Engineer](#11-market-research--auto-reverse-engineer)
12. [Supabase Backend](#12-supabase-backend)
13. [Zustand State Machine](#13-zustand-state-machine)
14. [Design Intelligence Levels](#14-design-intelligence-levels)
15. [Environment Variables](#15-environment-variables)
16. [Known Problems & Solutions](#16-known-problems--solutions)
17. [Request Mode Decision Tree](#17-request-mode-decision-tree)

---

## 1. WHAT THIS PLATFORM IS

**Vibe Weaver** is a browser-based AI web builder. A user describes something in plain English and the platform generates a fully working, multi-file React application rendered live in an iframe — no server compilation, no Node.js runtime, no deploy step.

Core differentiators vs generic code generators:
- **Brand-aware** — 70+ real brand design systems injected into the AI context automatically
- **Market-aware** — Tavily search + URL reverse-engineer before every build
- **Emergent style memory** — builds a fingerprint of user preferences across sessions
- **Pixel-safe sandbox** — generated code runs in Babel Standalone inside a sandboxed iframe with no npm
- **Fix-aware** — when editing existing builds, the full current codebase is injected as context

---

## 2. TECHNOLOGY STACK

### Frontend
| Technology | Version | Role |
|---|---|---|
| React | 18.3.1 | UI framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 5.4.19 | Dev server + build tool |
| @vitejs/plugin-react-swc | 3.11.0 | Fast JSX transform (SWC) |
| TailwindCSS | 3.4.17 | Utility CSS |
| @tailwindcss/typography | 0.5.16 | Prose styling in chat |
| tailwindcss-animate | 1.0.7 | CSS keyframe helpers |

### State & Data
| Technology | Version | Role |
|---|---|---|
| Zustand | 5.0.12 | Global client state |
| @tanstack/react-query | 5.83.0 | Server state + cache |
| react-hook-form | 7.61.1 | Form state |
| zod | 3.25.76 | Schema validation |

### UI Components
| Technology | Version | Role |
|---|---|---|
| Radix UI (20+ primitives) | various | Accessible headless components |
| shadcn/ui | — | Styled Radix wrappers |
| lucide-react | 0.462.0 | Icon library |
| sonner | 1.7.4 | Toast notifications |
| framer-motion | 12.38.0 | Animations |
| recharts | 2.15.4 | Charts in design panels |
| @monaco-editor/react | 4.7.0 | Code viewer/editor |
| react-markdown | 10.1.0 | Markdown rendering in chat |
| react-resizable-panels | 2.1.7 | Split-pane layout |
| vaul | 0.9.9 | Drawer component |
| cmdk | 1.1.1 | Command palette |
| embla-carousel-react | 8.6.0 | Carousel primitives |

### Backend / Cloud
| Technology | Role |
|---|---|
| Supabase (Postgres) | Projects, messages, builds, user data |
| Supabase Auth | Authentication (email + OAuth) |
| Supabase Edge Functions (Deno) | AI streaming proxy (ai-build function) |
| Supabase Storage | (reserved for future assets) |

### AI / External APIs
| Service | Role |
|---|---|
| Google Gemini (via OpenRouter) | Primary model for code generation |
| OpenRouter | Multi-model gateway (100+ models) |
| Ollama (local) | Optional local LLM support |
| Tavily Search API | Real-time web search for market research |
| Figma API | Design token extraction from Figma files |
| Unsplash CDN | Auto image fallback in generated code |

### Preview Runtime (loaded inside iframe)
| Library | Version | Role |
|---|---|---|
| React | 18 (CDN) | Generated app runtime |
| ReactDOM | 18 (CDN) | DOM mounting |
| Babel Standalone | latest (CDN) | JSX transpilation at runtime |
| Tailwind CSS CDN | Play CDN | Styling in generated apps |
| Google Fonts | CDN | Typography for generated apps |

### Dev Tools
| Tool | Role |
|---|---|
| Vitest | Unit testing |
| @testing-library/react | Component tests |
| ESLint + typescript-eslint | Linting |
| jszip | Project ZIP export |
| lovable-tagger | Dev-mode component labeling |

---

## 3. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (React SPA)                          │
│                                                                     │
│  ┌───────────────┐  ┌──────────────────────────┐  ┌─────────────┐ │
│  │   ChatPanel   │  │    PreviewPanel (iframe)  │  │  CodeViewer │ │
│  │  (left pane)  │  │    (center, live render)  │  │ (right pane)│ │
│  └───────┬───────┘  └──────────────────────────┘  └─────────────┘ │
│          │                        ▲                                 │
│          │  handleSend()          │ setPreviewHtml()                │
│          ▼                        │                                 │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    useAIBuild hook                            │ │
│  │  1. Detect mode (build/chat/plan)                             │ │
│  │  2. Enrich with: brand context, tokens, image, fingerprint    │ │
│  │  3. Stream from aiRouter → extractFiles → setFiles            │ │
│  │  4. onDone: buildIframeHtml → setPreviewHtml                  │ │
│  │  5. Save to Supabase, update emergence fingerprint            │ │
│  │  6. Run design critic (async background)                      │ │
│  └───────────────────────────────────────────────────────────────┘ │
│          │                                                           │
│          ▼                                                           │
│  ┌──────────────────┐     ┌──────────────────────────────────────┐ │
│  │   aiRouter.ts    │────▶│  Supabase Edge Function: ai-build    │ │
│  │  streamAIBuild() │     │  (Deno, streams tokens back via SSE) │ │
│  └──────────────────┘     └──────────────────────────────────────┘ │
│                                         │                            │
│                              ┌──────────▼──────────┐               │
│                              │  AI Model (via key)  │               │
│                              │  Gemini / OpenRouter │               │
│                              │  Ollama (local)      │               │
│                              └─────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
┌──────────────────┐          ┌─────────────────────┐
│ Supabase Postgres │          │   Tavily Search API  │
│  projects         │          │  (web research)      │
│  messages         │          └─────────────────────┘
│  builds           │
│  build_memory     │          ┌─────────────────────┐
│  user_fingerprints│          │     Figma API        │
│  design_dna       │          │  (token extraction)  │
└──────────────────┘          └─────────────────────┘
```

---

## 4. REPOSITORY FILE MAP

### Root
```
vibe-weaver-code/
├── BLUEPRINT.md              ← this file
├── package.json              ← dependencies + scripts
├── vite.config.ts            ← Vite config (port 8080, alias @→src, SWC)
├── tailwind.config.ts        ← TailwindCSS config (dark mode, CSS vars, tokens)
├── tsconfig.json             ← TypeScript config
├── .env                      ← secrets (Supabase, Tavily key, model keys)
├── .env.example              ← env template (safe to commit)
├── .gitignore
├── brand-master/             ← AsyncAPI brand assets (logos, colors, fonts, illustrations)
├── public/
│   └── design-md/            ← 50+ brand DESIGN.md files (Stripe, Spotify, Tesla, …)
│       └── {slug}/DESIGN.md  ← each brand's full design system specification
└── supabase/
    ├── config.toml
    ├── functions/
    │   └── ai-build/
    │       └── index.ts      ← Edge Function: AI streaming proxy (Deno runtime)
    └── migrations/
        ├── …_initial.sql     ← projects, messages, builds tables
        ├── …_auth.sql        ← auth policies (RLS)
        └── …_emergence.sql   ← build_memory, user_fingerprints, design_dna tables
```

### src/

```
src/
├── main.tsx                  ← React root mount (StrictMode)
├── App.tsx                   ← Router (/ → Index, /auth → Auth, * → NotFound)
├── vite-env.d.ts             ← import.meta.env type declarations
│
├── pages/
│   ├── Index.tsx             ← Main app layout: TopBar + 3-pane split (Chat|Preview|Code)
│   ├── Auth.tsx              ← Login / sign-up page
│   └── NotFound.tsx          ← 404 fallback
│
├── store/
│   └── raincastStore.ts      ← Zustand global store (all UI + build state)
│                               Key slices: messages, files, previewHtml, mode,
│                               activeBrandSlug, buildHistory, designSuggestions,
│                               emergenceStats, figmaToken, uploadedImage
│
├── hooks/
│   ├── useAIBuild.ts         ← PRIMARY HOOK: orchestrates entire build pipeline
│   │                           send(), regenerate(), buildFromPlan()
│   ├── useAuth.ts            ← Supabase auth state subscriber
│   ├── useGlobalShortcuts.ts ← Keyboard shortcuts (Shift+Tab mode toggle, etc.)
│   ├── usePreviewErrors.ts   ← Listens for postMessage errors from iframe
│   ├── use-mobile.tsx        ← Responsive breakpoint hook
│   └── use-toast.ts          ← Toast state hook
│
├── services/
│   │
│   ├── aiRouter.ts           ← CORE: ELITE_BUILD_SYSTEM_PROMPT + streamAIBuild()
│   │                           System prompt phases:
│   │                           BRAND OVERRIDE PROTOCOL
│   │                           PHASE 0 — Market Research (silent)
│   │                           PHASE 1 — Design Thinking (silent)
│   │                           PHASE 2 — Full Build Rules
│   │                           PHASE 3 — Multi-Page Builds
│   │                           PHASE 4 — No Broken Dependencies
│   │                           PHASE 5 — Image Discipline
│   │                           streamAIBuild() routes to Gemini/OpenRouter/Ollama
│   │
│   ├── codeCleaner.ts        ← Strips ES module syntax so code runs in Babel Standalone
│   │                           Removes: import/export, TypeScript types, require(),
│   │                           node_modules refs, React.destructure duplicates
│   │
│   ├── codeExtractor.ts      ← Parses AI stream into multi-file map
│   │                           Recognizes: ```jsx src/App.jsx fences
│   │                           Extracts: raincast-meta (project type + entry point)
│   │                           Handles partial/streaming content safely
│   │
│   ├── iframeBuilder.ts      ← Wraps bundled code into full standalone HTML
│   │                           Loads: React 18, ReactDOM, Babel Standalone, Tailwind CDN
│   │                           Preloads: 12 Google Font families
│   │                           Includes: Error boundary, image fallback, loading screen
│   │                           Brand-aware: sets font-family per brand slug
│   │
│   ├── projectExporter.ts    ← Generates downloadable ZIP of project files
│   │
│   ├── tavilySearch.ts       ← Tavily API integration
│   │                           searchProductWebsite(query) → TavilyResult | null
│   │                           extractBuildTarget(prompt) → search query string
│   │                           Filters out Wikipedia/Reddit/Quora from results
│   │
│   ├── brandMaster/
│   │   └── brandMasterService.ts  ← AsyncAPI brand-master log system
│   │                               logBrandMasterUsage(prompt, trigger, slug)
│   │                               getBrandMasterLog() → BrandMasterLogEntry[]
│   │                               buildBrandMasterContext(log) → AI injection string
│   │                               Persists to localStorage (max 200 entries)
│   │
│   ├── design/
│   │   ├── designMdLoader.ts      ← Brand catalog (70 brands) + DESIGN.md loader
│   │   │                           BRAND_CATALOG: BrandInfo[]  (slug, name, category, color, style)
│   │   │                           BRAND_CATEGORIES: 10 categories
│   │   │                           BRAND_MASTER_KEYWORDS: auto-trigger keywords
│   │   │                           loadBrandDesignMd(slug) → fetch /design-md/{slug}/DESIGN.md
│   │   │                           buildBrandInjectionMessage(slug, content) → structured prompt
│   │   │                           extractSection(content, heading) → section parser
│   │   │
│   │   ├── universalDesignContext.ts  ← UNIVERSAL_DESIGN_CONTEXT constant
│   │   │                               Injected into ELITE_BUILD_SYSTEM_PROMPT
│   │   │                               Covers: dark-first design, typography, spacing,
│   │   │                               color theory, animation rules, image usage
│   │   │
│   │   ├── designTokens.ts        ← BrandTokens type + buildBrandContext() prompt builder
│   │   │                           loadBrandTokens() from localStorage
│   │   │
│   │   ├── designCritic.ts        ← Post-build AI design analysis
│   │   │                           runDesignCritic(code, model) → DesignCritique
│   │   │                           Returns: score (0-10), topIssues[], suggestions[]
│   │   │
│   │   ├── designSystemGenerator.ts ← Generates full design system prompts
│   │   │                              isDesignSystemRequest(prompt) → boolean
│   │   │                              buildDesignSystemPrompt(prompt) → enriched prompt
│   │   │
│   │   ├── componentScanner.ts    ← Component library management
│   │   │                           loadScannedComponents() → ComponentDef[]
│   │   │                           buildComponentLibraryPrompt(comps) → injection string
│   │   │
│   │   ├── figmaService.ts        ← Figma API integration
│   │   │                           parseFigmaUrl(url) → { fileKey, nodeId }
│   │   │                           extractDesignTokens(fileKey, token) → design tokens
│   │   │                           getFigmaFrameImage(fileKey, nodeId, token) → image URL
│   │   │                           buildFigmaToCodePrompt(tokens) → code prompt
│   │   │
│   │   ├── imageAnalyzer.ts       ← Uploaded image handling
│   │   │                           fileToBase64(file) → { base64, mimeType }
│   │   │                           prepareImageMessage(b64, mime, prompt) → ChatMessage
│   │   │
│   │   └── index.ts               ← Re-exports all design services
│   │
│   └── emergence/
│       ├── index.ts               ← Engine exports
│       ├── buildMemory.ts         ← Saves build to Supabase build_memory table
│       │                           saveBuildMemory(userId, projectId, prompt, code, model)
│       │                           getRecentBuilds(userId, limit) → BuildMemory[]
│       │                           getEmergenceStats(userId) → stats object
│       │
│       ├── patternDetector.ts     ← Extracts style patterns from raw code
│       │                           detectPatterns(code) → PatternResult
│       │                           Detects: color schemes, component types, animation styles
│       │
│       ├── userFingerprint.ts     ← Style fingerprint computation
│       │                           computeFingerprint(builds) → StyleFingerprint
│       │                           loadFingerprint(userId) → StyleFingerprint | null
│       │                           persistFingerprint(userId, fp) → saves to Supabase
│       │
│       ├── contextInjector.ts     ← Injects fingerprint context into AI history
│       │                           injectEmergenceContext(history, fp) → enriched history
│       │
│       └── reverseEngineer.ts     ← URL → DesignDNA
│                                   reverseEngineerUrl(url, userId) → DesignDNA
│                                   Checks DB cache → Supabase edge function → heuristic fallback
│                                   heuristicDNA(url): detects brand category, returns palette/fonts
│
├── components/
│   │
│   ├── chat/
│   │   ├── ChatPanel.tsx          ← LEFT PANE: Main chat interface
│   │   │                           handleSend() pipeline (in order):
│   │   │                           1. Brand-master keyword detection (AsyncAPI auto-load)
│   │   │                           2. Generic brand auto-detection (70 brands)
│   │   │                           3. URL detection → reverseEngineerUrl()
│   │   │                           4. Figma URL → figmaService extraction
│   │   │                           5. Design system request → designSystemGenerator
│   │   │                           6. Fix/modify intent → inject current codebase
│   │   │                           7. Build intent → Tavily search → market enrichment
│   │   │                           8. Plain send
│   │   │                           Suggestion chips by category (Apps/Landing/Games/Dashboards)
│   │   │                           Shift+Tab: toggle Build/Plan mode
│   │   │
│   │   ├── MessageBubble.tsx      ← Chat message renderer
│   │   │                           parseAssistantMessage(): strips code blocks, ✦ briefs,
│   │   │                           injected context tags from display
│   │   │                           cleanUserDisplay(): strips market/codebase tags from user msg
│   │   │                           PlanCard: renders raincast-plan JSON blocks with "Build" button
│   │   │
│   │   └── PromptInput.tsx        ← Text input with image upload, model picker, send button
│   │
│   ├── preview/
│   │   └── PreviewPanel.tsx       ← CENTER PANE: iframe + device switcher
│   │                               Device modes: desktop / tablet / mobile
│   │                               Shows: design score, error overlays, evolution tracker
│   │                               Listens for postMessage (preview-ready, preview-error)
│   │
│   ├── code/
│   │   ├── CodeViewer.tsx         ← Monaco Editor (read-only) for viewing generated files
│   │   └── FileExplorer.tsx       ← File tree sidebar (tabs for each generated file)
│   │
│   ├── design/
│   │   ├── BrandSetupPanel.tsx    ← Manual brand token setup UI
│   │   ├── BrandStylePicker.tsx   ← Brand catalog picker (removed from ChatPanel, still exists)
│   │   ├── ComponentLibraryPanel.tsx ← Component library selection UI
│   │   ├── DesignCritiquePanel.tsx   ← Shows AI design score + critique breakdown
│   │   ├── DesignScoreWidget.tsx     ← Score badge overlay on preview
│   │   ├── DesignSuggestionToast.tsx ← Auto-fix suggestion popups (Design Partner Mode)
│   │   ├── EvolutionTracker.tsx      ← Build history visual timeline
│   │   └── ImageUploadButton.tsx     ← Drag-drop image upload trigger
│   │
│   ├── emergence/
│   │   ├── EmergencePanel.tsx     ← Stats panel: total builds, top patterns, fingerprint info
│   │   └── ReverseEngineerInput.tsx ← URL input for manual site reverse-engineering
│   │                                  (hidden from main UI; used internally)
│   │
│   ├── layout/
│   │   ├── TopBar.tsx             ← App header: logo, model selector, export, settings
│   │   ├── SettingsModal.tsx      ← API key management (Gemini, OpenRouter, Figma, Anthropic)
│   │   ├── ProjectsDrawer.tsx     ← Saved projects list
│   │   └── GuestModeBanner.tsx    ← Sign-in prompt for unauthenticated users
│   │
│   └── ui/                        ← 50+ shadcn/ui components (Button, Input, Dialog, etc.)
│
├── integrations/
│   └── supabase/
│       ├── client.ts              ← Supabase JS client (singleton)
│       └── types.ts               ← Auto-generated DB types from schema
│
└── lib/
    ├── utils.ts                   ← cn() (clsx + tailwind-merge)
    └── demoApp.ts                 ← Static demo HTML shown before first build
```

---

## 5. DATA FLOW: FULL BUILD LIFECYCLE

```
User types prompt
      │
      ▼
ChatPanel.handleSend(prompt)
      │
      ├─── [brand-master keywords?] ──▶ Load AsyncAPI DESIGN.md → setActiveBrand()
      │                                 Log to localStorage (trigger: "auto" | "user")
      │
      ├─── [brand name in prompt?] ──▶ Match BRAND_CATALOG (70 brands)
      │                                 Fetch /design-md/{slug}/DESIGN.md
      │                                 setActiveBrand(slug, content)
      │
      ├─── [https:// URL in prompt?] ──▶ reverseEngineerUrl(url)
      │                                  Check DB cache → Edge fn → heuristic
      │                                  Prepend DesignDNA to prompt
      │
      ├─── [Figma URL?] ──▶ extractDesignTokens() + getFigmaFrameImage()
      │                      buildFigmaToCodePrompt() → prepend to prompt
      │
      ├─── [Design system request?] ──▶ buildDesignSystemPrompt() → send
      │
      ├─── [Fix/improve + existing files?] ──▶ Inject current codebase (≤24KB)
      │                                        "[CODEBASE CONTEXT — apply ONLY changes]"
      │
      └─── [Build intent?] ──▶ Tavily search extractBuildTarget(prompt)
                                searchProductWebsite(query) → best URL
                                reverseEngineerUrl(url) → DesignDNA
                                enrichWithMarketContext(prompt) → [MARKET CONTEXT: ...]
                                Send enriched prompt

      ▼
useAIBuild.send(enrichedPrompt)
      │
      ├─ Detect requestMode: build | chat | plan
      │   - plan mode + no trigger → "plan"
      │   - has files + not build keyword → "chat"
      │   - else → "build"
      │
      ├─ Create project in Supabase (if user authed + first build)
      ├─ addMessage(userMsg) + addMessage(asstMsg placeholder)
      ├─ setBuilding(true)
      │
      ├─ [build mode] Load StyleFingerprint from Supabase
      │   injectEmergenceContext(history, fingerprint)
      │
      ├─ [has uploaded image] prepareImageMessage() → splice into history
      │
      ├─ [activeBrandContext] buildBrandInjectionMessage() → prepend to history
      │
      ├─ [brandTokens] buildBrandContext() → prepend to history
      │
      ├─ [activeComponentNames] buildComponentLibraryPrompt() → prepend to history
      │
      ▼
streamAIBuild({ messages, model, keys, onDelta, onDone, onError })
      │
      ├─ Prepend ELITE_BUILD_SYSTEM_PROMPT as first user message
      ├─ Route to model:
      │   Gemini API → direct fetch to generativelanguage.googleapis.com
      │   OpenRouter → fetch to openrouter.ai/api/v1/chat/completions (SSE)
      │   Ollama → fetch to localhost:11434/api/chat (streaming JSON)
      │
      ▼ Token-by-token streaming
      │
      onDelta(chunk):
        accumulated += chunk
        updateAssistantMessage(asstId, accumulated)  ← live chat updates
        extractFiles(accumulated) → { files, entry, type }
        if files found: setFiles(files, entry, type)  ← live code viewer updates
      │
      onDone():
        extractFiles(accumulated) → final file map
        bundleFiles(files, entry) → single script body
        buildIframeHtmlFromFiles(files, entry, brandSlug) → full HTML
        setPreviewHtml(html)  ← iframe src="data:..." updates live preview

        [if authed]:
          supabase.from("messages").insert(assistant message)
          supabase.from("builds").insert(final code)
          saveBuildMemory() → build_memory table
          computeFingerprint(recent 30 builds) → StyleFingerprint
          persistFingerprint(userId, fp) → user_fingerprints table
          getEmergenceStats() → setEmergenceStats()
          addBuildSnapshot() → evolution tracker

        toast.success("Build ready")
        setUploadedImage(null)  ← clear after build

        [async background]:
          runDesignCritic(finalCode, model)
          → setDesignScore() + setDesignCritique()
          → if designPartnerMode: addDesignSuggestion() × 2

      onError(e):
        setBuilding(false)
        Rate limit (429) / credits exhausted (402) / generic error toast
```

---

## 6. AI PIPELINE DEEP DIVE

### System Prompt Architecture (`aiRouter.ts`)

The `ELITE_BUILD_SYSTEM_PROMPT` is prepended as the FIRST user message in every build conversation (not as a system role, because some providers don't support system messages well).

```
ELITE_BUILD_SYSTEM_PROMPT = UNIVERSAL_DESIGN_CONTEXT + phases below
```

**BRAND OVERRIDE PROTOCOL**
Activated when `<<BRAND_STYLE_SYSTEM: NAME>>` appears in any message.
Forces AI to use ONLY that brand's colors, fonts, radius, shadows.
Overrides all generic defaults. Includes implementation checklist.

**PHASE 0 — MARKET RESEARCH (silent)**
AI silently plans before touching design or code:
1. Real Product Analysis — does it exist? who are top 3 competitors?
2. Market Context — what do users expect? what's table stakes vs differentiator?
3. Content Realism — use real data, real feature names, realistic numbers
4. Design Inference — infer known design from training data if no system injected

Output: NEVER shown. Informs code decisions only.

**PHASE 1 — DESIGN THINKING (silent)**
AI plans internally: type, aesthetic, color palette, typography, layout, spacing,
motion, parallax, signature detail, architecture, sections. Never outputs this block.

**PHASE 2 — FULL BUILD RULES**
Minimum 7 sections for a website (navbar, hero, features, showcase, stats, CTA, footer).
Mandatory animation list: parallax, scroll reveals, stagger, smooth scroll, navbar behavior,
hover micro-interactions, counter animations, cursor effects, loading screen, page transitions.
Image URL format with unique seeds to prevent repeats.
Full image library by category (automotive, tech, architecture, nature, people, food, etc.).

**PHASE 3 — MULTI-PAGE BUILDS**
useState-based navigation. Minimum pages by type:
- website: home/about/product/contact
- dashboard: main/feature/profile/notifications
- game: menu/gameplay/gameover/leaderboard

**PHASE 4 — NO BROKEN DEPENDENCIES**
Hard ban: framer-motion, chart.js, three.js, react-player, react-spring, and all npm packages.
Hard ban: require() calls, node_modules paths.
Only allowed: React 18 globals + Tailwind CDN + Google Fonts CDN.

**PHASE 5 — IMAGE DISCIPLINE**
No stock photos for: calculators, tools, games, text-only UIs.
Use Unsplash only for: landing pages, e-commerce, media, lifestyle.

### Model Routing

```typescript
streamAIBuild({ model, keys }) →

if model === "ollama/*":
  POST localhost:11434/api/chat  (streaming JSON lines)

else if keys.geminiApiKey && model starts with "google/":
  POST generativelanguage.googleapis.com/…/streamGenerateContent

else if keys.openrouter:
  POST openrouter.ai/api/v1/chat/completions  (SSE stream)

else:
  Supabase Edge Function ai-build (Deno, proxies to configured model)
```

---

## 7. CODE EXTRACTION & BUNDLING PIPELINE

### Step 1 — Stream Parsing (`codeExtractor.ts`)

AI outputs code in fenced blocks with path annotations:

```
```jsx src/App.jsx
function App() { ... }
```

```jsx src/components/Navbar.jsx
function Navbar() { ... }
```

```raincast-meta
{ "type": "website", "entry": "src/App.jsx" }
```
```

`extractFiles(rawStream)` uses a regex tokenizer that handles:
- Open (partial) fences during streaming
- Path from fence line OR first-line comment (`// src/App.jsx`)
- Collision resolution: longer content wins (later stream chunks are complete)
- Automatic entry detection: App.jsx / index.jsx fallback

### Step 2 — Cleaning (`codeCleaner.ts`)

Each file goes through `cleanModuleCode()`:

```
Input (AI-generated ES module):          Output (Babel Standalone safe):
─────────────────────────────────────    ────────────────────────────────
import React from "react"           →   (removed)
import { useState } from "react"    →   (removed — hook is a global)
import Navbar from "./Navbar"       →   (removed — bundled separately)
export default function App() {     →   function App() {
export const Button = ...           →   const Button = ...
const x = require("some-pkg")      →   (removed)
interface Props { ... }             →   (removed)
type Foo = string                   →   (removed)
(val as string)                     →   (val)
: string                            →   (removed — primitives only)
src="../node_modules/pkg/img.png"   →   src=""
const { useState } = React;         →   (removed — already global)
```

### Step 3 — Bundling (`codeCleaner.ts bundleFiles()`)

Non-entry files first, entry last:
```
/* ===== src/components/Navbar.jsx ===== */
function Navbar() { ... }
/* ===== /src/components/Navbar.jsx ===== */

/* ===== src/App.jsx (entry) ===== */
function App() {
  return <Navbar />  // Navbar is in scope — same global script
}
/* ===== /src/App.jsx ===== */
```

### Step 4 — iframe Wrapping (`iframeBuilder.ts`)

Wraps bundled script into a full HTML document:
```html
<!DOCTYPE html>
<html>
<head>
  <!-- 12 Google Font families preloaded -->
  <!-- React 18 CDN -->
  <!-- ReactDOM 18 CDN -->
  <!-- Babel Standalone CDN -->
  <!-- Tailwind Play CDN -->
  <!-- Tailwind config: brand font aliases -->
  <style>
    /* Hard resets: box-sizing, bg #0a0a0f, body margin 0 */
    /* Image shimmer + lazy loading CSS */
    /* Error display CSS */
  </style>
</head>
<body>
  <div id="__rc_loading">Loading preview…</div>
  <div id="root"></div>
  <script>
    /* Global error handler → postMessage(preview-error) */
    /* Unhandled rejection handler */
    /* Auto image fallback: Unsplash → Picsum → gradient placeholder */
  </script>
  <script type="text/babel" data-presets="react">
    try {
      /* REACT_PREAMBLE: const { useState, useEffect, … } = React; */
      /* useScrollReveal(), animateCounter(), scrollToId(), useScrolled() */
      /* __RaincastErrorBoundary class */
      /* BUNDLED USER CODE */
      const __root = ReactDOM.createRoot(document.getElementById('root'));
      __root.render(<__RaincastErrorBoundary><App /></__RaincastErrorBoundary>);
      parent.postMessage({ type: 'preview-ready' }, '*');
    } catch (err) {
      /* Compile error display */
    }
  </script>
</body>
</html>
```

**Built-in helpers available to generated code (no import needed):**
- `useState, useEffect, useRef, useMemo, useCallback, useContext, useReducer` and all React 18 hooks
- `createContext, createElement, Fragment, forwardRef, memo, lazy, Suspense`
- `useScrollReveal(selector?)` — IntersectionObserver fade+slide reveal
- `animateCounter(el, target, duration?)` — count-up animation
- `scrollToId(id)` — smooth scroll to element
- `useScrolled(threshold?)` — navbar scroll state

---

## 8. BRAND INTELLIGENCE SYSTEM

### Brand Catalog (`designMdLoader.ts`)

70 brands across 10 categories:

| Category | Brands |
|---|---|
| Open Source | AsyncAPI |
| AI | Claude, Mistral AI, ElevenLabs, Ollama, Cohere, Replicate, RunwayML, Together AI, MiniMax, xAI/Grok |
| Dev Tools | Vercel, Cursor, Supabase, Linear, Raycast, Warp, Resend, Sentry, PostHog, HashiCorp, ClickHouse, Expo |
| Fintech | Stripe, Coinbase, Revolut, Binance, Kraken, Wise, Mastercard, Uber |
| Automotive | Tesla, Ferrari, Lamborghini, Bugatti, BMW, BMW M, Renault |
| Consumer | Apple, Nike, Spotify, Starbucks, Shopify, Airbnb, Pinterest |
| Productivity | Notion, Figma, Miro, Airtable, Framer, Cal.com, Webflow, Intercom, Superhuman |
| Media | The Verge, Wired |
| Gaming | PlayStation, SpaceX |
| Enterprise | IBM, MongoDB, Sanity, Mintlify, Clay, Composio, Vodafone, Meta, Lovable, Opencode AI, VoltAgent, NVIDIA |

### Auto-Detection Flow

```
User prompt: "build a Stripe-style checkout"
      │
      ▼
ChatPanel.handleSend() — phase 2: AUTO-BRAND DETECTION
  BRAND_CATALOG.find(brand =>
    lowerPrompt.includes(brand.name.toLowerCase()) ||
    lowerPrompt.includes(brand.slug.replace(/[.-]/g, ""))
  )
  → matchedBrand = { slug: "stripe", name: "Stripe", primaryColor: "#635bff", style: "light" }
      │
      ▼
loadBrandDesignMd("stripe")
  → fetch /design-md/stripe/DESIGN.md
  → cache in memory Map<slug, content>
      │
      ▼
setActiveBrand("stripe", designMdContent)
  → stored in Zustand: activeBrandSlug, activeBrandContext
      │
      ▼  (happens in useAIBuild.runAIStream)
buildBrandInjectionMessage("stripe", designMdContent)
  → extractSection(content, "Agent Prompt Guide")  ← PRIORITY 1
  → extractSection(content, "Do")                  ← PRIORITY 2
  → extractSection(content, "Color")               ← PRIORITY 3
  → extractSection(content, "Typography")          ← PRIORITY 4
  → extractSection(content, "Component")           ← PRIORITY 5
  → full DESIGN.md                                 ← REFERENCE
  → CSS variables block with exact brand hex
  → Implementation checklist (8 items)
  → Prepended as first message in AI conversation
```

### DESIGN.md Format

Each brand's DESIGN.md has 9 sections:
1. Brand Overview
2. Color System (exact hex values, semantic roles)
3. Typography (fonts, sizes, weights, tracking)
4. Spacing & Layout (grid, padding, breakpoints)
5. Component Specifications (button, card, nav, etc.)
6. Animation & Motion (easing, duration, properties)
7. Do's and Don'ts
8. Image & Icon Guidelines
9. Agent Prompt Guide (MOST IMPORTANT — actionable implementation rules)

### Brand Font Preloading (`iframeBuilder.ts`)

When a brand is active, the iframe loads the matching Google Font:
```
asyncapi  → Work Sans
stripe    → DM Sans
spotify   → Plus Jakarta Sans
ferrari   → Cormorant Garamond
bugatti   → Playfair Display
nike      → Bebas Neue
tesla     → Montserrat
cursor    → Space Grotesk
claude    → Instrument Serif
```
Tailwind aliases: `font-brand`, `font-display` → brand font; `font-mono` → JetBrains Mono.

### AsyncAPI Brand-Master (`brandMasterService.ts`)

Special handling for the platform's own brand (AsyncAPI):

**Auto-trigger keywords:** asyncapi, async api, our brand, brand master, brand-master, our design, our style, our platform

**Usage logging:**
```typescript
BrandMasterLogEntry {
  id: UUID
  timestamp: ISO string
  trigger: "auto" | "user"      ← was it AI-detected or user-requested?
  prompt: string (first 200 chars)
  brandSlug: string
}
```
Stored in localStorage (key: `brand_master_usage_log`, max 200 entries).
Log injected as context into next build: maintains style consistency across sessions.

---

## 9. EMERGENCE ENGINE (STYLE MEMORY)

The Emergence Engine learns from every build and injects style preferences into future builds.

```
Every completed build:
      │
      ▼
saveBuildMemory(userId, projectId, prompt, code, model)
  → INSERT INTO build_memory (user_id, project_id, prompt, code, model, created_at)
      │
      ▼
getRecentBuilds(userId, 30) → last 30 builds
      │
      ▼
computeFingerprint(builds) → StyleFingerprint {
  colorScheme: "dark" | "light" | "mixed"
  primaryColors: string[]          ← most used hex values
  preferredFonts: string[]         ← detected font names
  componentFrequency: Record<string, number>  ← card, modal, sidebar counts
  animationStyle: "minimal" | "moderate" | "rich"
  layoutPatterns: string[]         ← hero, sidebar, grid, etc.
  buildCount: number
  lastUpdated: string
}
      │
      ▼
persistFingerprint(userId, fp)
  → UPSERT INTO user_fingerprints (user_id, fingerprint, updated_at)
      │
      ▼  (next build, at start of runAIStream)
loadFingerprint(userId) → StyleFingerprint
      │
      ▼
injectEmergenceContext(history, fingerprint)
  → prepends system message: "This user prefers dark themes, Inter font,
    card-based layouts, rich animations. Match their established style."
  → enrichedHistory used for AI stream
```

### Database Tables

```sql
-- Build memory (one row per completed build)
build_memory (
  id uuid PK,
  user_id uuid FK auth.users,
  project_id uuid FK projects,
  prompt text,
  code text,
  model text,
  created_at timestamptz
)

-- Style fingerprint (one row per user, upserted after every build)
user_fingerprints (
  user_id uuid PK FK auth.users,
  fingerprint jsonb,    -- StyleFingerprint object
  updated_at timestamptz
)

-- Design DNA cache (reverse engineer results)
design_dna (
  id uuid PK,
  user_id uuid FK auth.users,
  url text,
  title text,
  dna jsonb,            -- { palette, fonts, layout, mood, components, promptSuggestion }
  created_at timestamptz,
  UNIQUE (user_id, url)
)
```

---

## 10. PREVIEW SANDBOX SYSTEM

### Security Isolation

The preview iframe uses `srcdoc` (not `src`) with these restrictions:
- No same-origin access to parent window
- No localStorage/sessionStorage access from generated code
- No network requests except CDN (Unsplash, Picsum)
- All code runs in Babel Standalone context (no Node.js)

### PostMessage Communication

```
iframe → parent:
  { type: 'preview-ready' }        ← build succeeded, hide loading
  { type: 'preview-error',         ← runtime error
    message: string,
    stack: string }

parent → iframe:
  (no messages sent currently)
```

### Auto Image Fallback

Every `<img>` tag in generated code is intercepted by a MutationObserver:
```
img.onload  → img.classList.add('rc-loaded')      → visible
img.onerror → retry 1: Unsplash backup ID + new seed
           → retry 2: Picsum random photo
           → retry 3: CSS gradient placeholder, remove src
```

### Error Boundary

`__RaincastErrorBoundary` wraps the entire `<App>` in a React error boundary.
Catches runtime React errors, posts to parent, shows error display in preview.

---

## 11. MARKET RESEARCH & AUTO REVERSE-ENGINEER

### Tavily Search Flow

```
User: "build me a food delivery app"
      │
      ▼
isBuildIntent = true
isNotReal = false (no fictional/fake keywords)
      │
      ▼
extractBuildTarget("build me a food delivery app")
  → checks "like X" pattern → no
  → checks 70 known brands → "doordash" match if present → else
  → type match: "food delivery" → returns "food delivery app website"
      │
      ▼
searchProductWebsite("food delivery app website")
  POST https://api.tavily.com/search {
    api_key: VITE_TAVILY_API_KEY,
    query: "food delivery app website",
    search_depth: "basic",
    max_results: 5
  }
  → filters out: wikipedia, reddit, quora, medium, stackoverflow
  → returns best result: { url: "https://doordash.com", title: "DoorDash", content: "..." }
      │
      ▼
reverseEngineerUrl("https://doordash.com", userId)
  → check design_dna DB cache → miss
  → POST supabase edge function "reverse-engineer" → success? → save to DB
  → else: heuristicDNA("https://doordash.com")
    hostname analysis: isColorful=true, isTech=false
    → palette: ["#ea4c89", "#1769ff", "#ff7c00", "#00c3ff", "#ffffff"]
    → fonts: ["Inter", "Instrument Serif"]
    → mood: "vibrant, energetic, brand-forward"
    → promptSuggestion: "Build a vibrant, energetic, brand-forward UI inspired by doordash.com..."
      │
      ▼
send("[MARKET RESEARCH: DoorDash — https://doordash.com]
{dna.promptSuggestion}

User request: {enrichWithMarketContext(prompt)}")
```

### Market Context Enrichment

10 product category patterns with competitive intelligence:
- Music streaming → Spotify, Apple Music, Tidal patterns
- Food delivery → DoorDash, Uber Eats patterns
- Social media → X, Instagram, TikTok patterns
- E-commerce → Amazon, Shopify patterns
- Fintech → Stripe, Revolut, Coinbase patterns
- SaaS dashboard → Linear, Notion, Figma patterns
- AI product → Claude, ChatGPT, Perplexity patterns
- Fitness → Nike Training, Strava, Fitbit patterns
- Travel → Airbnb, Booking.com patterns
- News/Media → The Verge, Wired patterns

### Fix/Modify Intent — Codebase Injection

```
User: "fix the navbar to be sticky"
Existing files: { "src/App.jsx": "...", "src/Navbar.jsx": "..." }
      │
      ▼
FIX_RE.test(prompt) = true ("fix")
hasExistingCode = true
      │
      ▼
Build context (up to 24KB):
"[CODEBASE CONTEXT — these are the EXISTING files already built.
Read them carefully, then apply ONLY the requested changes.
Keep all other code intact.]

// FILE: src/App.jsx
function App() { ... }
---
// FILE: src/Navbar.jsx
function Navbar() { ... }

[END CODEBASE CONTEXT]

User request: fix the navbar to be sticky"
      │
      ▼
AI receives full current code → makes targeted change → streams back modified files
```

---

## 12. SUPABASE BACKEND

### Database Tables

```sql
projects (
  id uuid PK,
  user_id uuid FK auth.users,
  title text,
  created_at timestamptz,
  updated_at timestamptz
)

messages (
  id uuid PK,
  project_id uuid FK projects,
  user_id uuid FK auth.users,
  role text CHECK (role IN ('user','assistant')),
  content text,
  created_at timestamptz
)

builds (
  id uuid PK,
  project_id uuid FK projects,
  user_id uuid FK auth.users,
  code text,
  model text,
  created_at timestamptz
)

build_memory (id, user_id, project_id, prompt, code, model, created_at)
user_fingerprints (user_id PK, fingerprint jsonb, updated_at)
design_dna (id, user_id, url, title, dna jsonb, created_at, UNIQUE(user_id, url))
```

### Row-Level Security

All tables have RLS enabled. Policies:
- Users can only read/write their own rows (`auth.uid() = user_id`)
- No cross-user data access

### Edge Function: `ai-build`

Deno-based streaming proxy deployed to Supabase Functions.
Receives `{ messages, model, keys }`, routes to configured AI provider,
streams tokens back via Server-Sent Events.
Used when no client-side API key is configured.

---

## 13. ZUSTAND STATE MACHINE

### State Slices

```typescript
// Chat
messages: ChatMessage[]           // [{id, role, content}]
isBuilding: boolean

// Multi-file project
files: Record<string, string>     // path → code content
entryFile: string                 // e.g. "src/App.jsx"
projectType: ProjectType          // website/webapp/game/…
openTabs: string[]                // open files in editor
activeFile: string | null
currentCode: string               // entry file content (backwards compat)

// Preview
previewHtml: string               // full iframe HTML
previewError: string | null
device: "desktop" | "tablet" | "mobile"

// App
mode: "build" | "plan"
recentlyChanged: string[]         // highlighted paths in file explorer
activeProjectId: string | null
activeProjectTitle: string

// AI keys
anthropicKey: string              // from localStorage
geminiKey: string                 // from localStorage
openrouterKey: string             // from localStorage
ollamaUrl: string                 // from localStorage
figmaToken: string                // from localStorage
selectedModel: string

// Design Intelligence
uploadedImage: string | null      // base64
uploadedImageName: string | null
uploadedImageMime: string
brandTokens: BrandTokens | null
designScore: number | null        // 0–10 from designCritic
designCritique: DesignCritique | null
designPartnerMode: boolean
designSuggestions: DesignSuggestion[]
buildHistory: BuildSnapshot[]     // for evolution tracker
showCritiquePanel: boolean
activeComponentNames: string[]

// Brand System
activeBrandSlug: string | null
activeBrandContext: string | null // raw DESIGN.md content

// Emergence
emergenceStats: { totalBuilds, topPatterns[] } | null
```

### Key Actions

| Action | Effect |
|---|---|
| `addMessage(m)` | Append to messages array |
| `updateAssistantMessage(id, content)` | Live-update streaming AI message |
| `setFiles(files, entry, type)` | Update multi-file state, preserve open tabs |
| `setPreviewHtml(html)` | Trigger iframe re-render |
| `setActiveBrand(slug, context)` | Store active brand for next build |
| `clearBrand()` | Remove active brand |
| `addBuildSnapshot(snap)` | Add to evolution history (max 10) |
| `toggleMode()` | Switch build ↔ plan |
| `resetProject()` | Clear all build state |

---

## 14. DESIGN INTELLIGENCE LEVELS

The platform has 8 levels of design intelligence, all optional and additive:

| Level | Feature | Where |
|---|---|---|
| 1 | Image upload → visual reference for build | ImageUploadButton + imageAnalyzer |
| 2 | Figma token extraction → design-to-code | figmaService + ChatPanel |
| 2.5 | Brand DESIGN.md injection (70 brands) | designMdLoader + useAIBuild |
| 3 | Custom brand tokens (manual setup) | BrandSetupPanel + designTokens |
| 4 | Component library selection | ComponentLibraryPanel + componentScanner |
| 5 | Post-build design critic (AI score) | designCritic + DesignCritiquePanel |
| 6 | Design system generator | designSystemGenerator |
| 7 | Build evolution tracker | buildHistory + EvolutionTracker |
| 8 | Design Partner Mode (auto-fix suggestions) | designPartnerMode + DesignSuggestionToast |

---

## 15. ENVIRONMENT VARIABLES

```bash
# Supabase (required)
VITE_SUPABASE_URL="https://xxx.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJ..."
VITE_SUPABASE_PROJECT_ID="xxx"

# AI Keys (at least one required for model routing)
VITE_GEMINI_KEY="AIza..."           # Google Gemini direct API
VITE_ANTHROPIC_KEY="sk-ant-..."     # Anthropic Claude (via OpenRouter usually)

# External Services
VITE_TAVILY_API_KEY="tvly-dev-..."  # Web search for market research

# Optional (can be set in-app via Settings modal)
# VITE_OPENROUTER_KEY — set in localStorage as "openrouter_key"
# VITE_FIGMA_TOKEN — set in localStorage as "figma_token"
# Ollama URL — set in localStorage as "ollama_url" (default: http://localhost:11434)
```

---

## 16. KNOWN PROBLEMS & SOLUTIONS

### Problem: AI generates node_modules imports
**Root cause:** AI was trained on standard ES module code with npm dependencies.
**Solution (codeCleaner.ts):**
- `REQUIRE_CALL_RE` strips `const x = require('pkg')`
- `BARE_REQUIRE_RE` strips standalone `require('pkg')`
- `NODE_MODULES_SRC_RE` blanks `src="../node_modules/..."` attributes
- PHASE 4 system prompt explicitly bans framer-motion, chart.js, react-player, etc.

### Problem: AI generates TypeScript in Babel Standalone (no TS support)
**Solution (codeCleaner.ts):**
- `TS_INTERFACE_RE` strips `interface Foo { ... }`
- `TS_TYPE_ALIAS_RE` strips `type Foo = ...`
- `TS_AS_CAST_RE` strips `as SomeType` casts
- `TS_PRIMITIVE_TYPE_RE` strips `: string`, `: number`, etc.

### Problem: React hook destructuring causes SyntaxError
**Root cause:** AI writes `const { useState } = React;` but REACT_PREAMBLE already declares these as globals — duplicate `const` in same scope.
**Solution:** `REACT_DESTRUCTURE_RE` strips these lines entirely.

### Problem: Multi-file fences bleed into each other
**Root cause:** Babel transpiles the entire bundled script as one — a malformed JSX return in file A causes a parse error that points to file B's code.
**Solution (bundleFiles):** Each file wrapped in comment delimiters so error messages are scoped. Non-entry files always placed before entry.

### Problem: Images all look the same / break
**Root cause:** AI reuses same Unsplash photo IDs; CORS blocks many Unsplash URLs.
**Solution (iframeBuilder.ts):**
- Auto-image-handler intercepts all `<img>` tags via MutationObserver
- Three retry levels: backup ID → Picsum → gradient placeholder
- System prompt mandates `?v=${Math.random()}` seed on every Unsplash URL
- PHASE 5 bans stock photos for tools/games/calculators

### Problem: Design Brief block clutters chat
**Root cause:** PHASE 1 originally instructed AI to output a verbose ✦ Design Brief before code.
**Solution:**
- PHASE 1 changed to silent (AI plans internally, never outputs)
- `parseAssistantMessage` strips any residual ✦ blocks as safety net
- `cleanUserDisplay` strips injected `[MARKET CONTEXT]` / `[CODEBASE CONTEXT]` tags from display

### Problem: AI starts from scratch when user says "fix the navbar"
**Root cause:** AI has no memory of current code in a new message.
**Solution (ChatPanel.tsx FIX_RE):**
- Detects fix/update/change/improve/add keywords + existing files in store
- Injects full current codebase (up to 24KB) as `[CODEBASE CONTEXT]`
- AI instructed: "apply ONLY the requested changes, keep all other code intact"

### Problem: Brand picker (70 brands) cluttering the UI
**Solution:** Removed `<BrandStylePicker>` component from ChatPanel JSX entirely. All brand detection is invisible — auto-triggered by keyword/name match in the prompt.

### Problem: Build looks generic, not like real brands
**Solution (multi-layer brand system):**
1. DESIGN.md files with 9 sections per brand (≥500 lines each)
2. Section 9 "Agent Prompt Guide" extracted as PRIORITY 1 instruction
3. Do's/Don'ts as PRIORITY 2 (violations = failed build)
4. CSS variables block with exact brand hex injected
5. Implementation checklist (8 items) AI must satisfy
6. Brand-specific Google Font loaded in iframe
7. BRAND OVERRIDE PROTOCOL in system prompt forces compliance

---

## 17. REQUEST MODE DECISION TREE

```
User submits message
        │
        ▼
Current mode = "plan"?
   YES → isPlanBuildTrigger("build it", "go ahead", etc.)?
            YES → requestMode = "build", setMode("build")
            NO  → requestMode = "plan"
   NO  → hasFiles && !isBuildRequest(prompt)?
            YES → requestMode = "chat"   (follow-up conversation)
            NO  → requestMode = "build"  (new or continuation build)

requestMode = "build":
  - Loads fingerprint, injects emergence context
  - Injects brand DESIGN.md context if active
  - Runs full streaming pipeline
  - On done: saves to DB, updates fingerprint, runs design critic

requestMode = "chat":
  - No code extraction, no iframe update
  - Conversational response only
  - Useful for: "explain what the hero section does", "what color is this button?"

requestMode = "plan":
  - No code extraction, no iframe update
  - AI returns raincast-plan JSON block
  - PlanCard in MessageBubble shows structured plan
  - "Build This Now" button calls buildFromPlan(planRaw)
```

---

## APPENDIX: handleSend() Complete Pipeline

```
ChatPanel.handleSend(prompt)
  1. BRAND-MASTER CHECK
     → BRAND_MASTER_KEYWORDS.some(kw => prompt.includes(kw)) || /asyncapi/ test
     → logBrandMasterUsage(prompt, "auto"|"user", "asyncapi")
     → loadBrandDesignMd("asyncapi") → setActiveBrand()
     → inject prior session log as context → send() → return

  2. AUTO-BRAND DETECTION
     → BRAND_CATALOG.find(brand => name/slug in prompt)
     → loadBrandDesignMd(brand.slug) → setActiveBrand()

  3. FIGMA URL CHECK
     → isFigmaUrl(prompt) && figmaToken
     → parseFigmaUrl → extractDesignTokens → getFigmaFrameImage
     → buildFigmaToCodePrompt → send() → return

  4. DESIGN SYSTEM REQUEST
     → isDesignSystemRequest(prompt)
     → buildDesignSystemPrompt(prompt) → send() → return

  5. EXPLICIT URL
     → prompt.match(/https?:\/\/[^\s]+/i) or domain pattern
     → reverseEngineerUrl(detectedUrl, userId)
     → enrichWithMarketContext(prompt)
     → send("[SITE DNA: ...]\n{dna}\n\nUser request: {enriched}") → return

  6. FIX/MODIFY INTENT
     → FIX_RE.test(prompt) && files non-empty && no detectedUrl
     → build codeContext from current files (≤24KB)
     → send("[CODEBASE CONTEXT...]\n\nUser request: {prompt}") → return

  7. BUILD INTENT
     → isBuildIntent regex match
     → enrichWithMarketContext(prompt)
     → if !fictional: searchProductWebsite(extractBuildTarget(prompt))
       → if found: reverseEngineerUrl(tavilyResult.url)
         → send("[MARKET RESEARCH: ...]\n{dna}\n\nUser request: {enriched}") → return
     → send(enriched) → return

  8. FALLBACK
     → send(prompt)
```

---

*Generated: 2026-05-06 | Platform: Vibe Weaver | Stack: React 18 + Vite + Supabase + Babel Standalone*
